"""Deploy prebuilt SIMS artifacts with backups and automatic application rollback.

Requires paramiko and SIMS_HOST, SIMS_SSH_PASSWORD, SIMS_DB_PASSWORD.
Build and test server/ and client/ before running this script.
"""
import datetime
import hashlib
import os
from pathlib import Path
import shlex
import tarfile
import tempfile
import time
import sys
import paramiko


ROOT = Path(__file__).resolve().parents[1]
RELEASE = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
REMOTE = f"/opt/sims/releases/{RELEASE}"
BACKUP = f"/opt/sims/backups/{RELEASE}"


def main():
    frontend_only = "--frontend-only" in sys.argv
    jar = ROOT / "server/target/sims-server-0.0.1-SNAPSHOT.jar"
    assert jar.is_file() and (ROOT / "client/dist/index.html").is_file(), "Build artifacts missing"
    ssh = paramiko.SSHClient()
    ssh.load_system_host_keys()
    ssh.connect(os.environ["SIMS_HOST"], username="root", password=os.environ["SIMS_SSH_PASSWORD"],
                timeout=15, auth_timeout=20, allow_agent=False, look_for_keys=False)

    def run(command, timeout=90):
        _, out, err = ssh.exec_command(command, timeout=timeout)
        output = out.read().decode()
        error = err.read().decode()
        if out.channel.recv_exit_status() != 0:
            raise RuntimeError(error[-1500:] or output[-1500:] or "Remote command failed")
        return output.strip()

    database_prefix = "MYSQL_PWD=" + shlex.quote(os.environ["SIMS_DB_PASSWORD"])
    switched = False
    try:
        run(f"mkdir -p {REMOTE} {BACKUP}; chmod 700 {BACKUP}")
        run(f"cp -p /opt/sims/sims-server.jar {BACKUP}/sims-server.jar; tar -czf {BACKUP}/frontend.tar.gz -C /var/www/html .")
        run(f"{database_prefix} mysqldump -uroot --single-transaction --no-tablespaces sim_system_db > {BACKUP}/database.sql && test -s {BACKUP}/database.sql")
        print(f"Application and database backup: {BACKUP}", flush=True)
        with tempfile.TemporaryDirectory(prefix="sims-release-") as temp:
            frontend = Path(temp) / "frontend.tar.gz"
            source = Path(temp) / "source.tar.gz"
            with tarfile.open(frontend, "w:gz") as archive:
                archive.add(ROOT / "client/dist", arcname=".")
            with tarfile.open(source, "w:gz") as archive:
                for relative in ["server/src", "server/pom.xml", "client/src", "client/scripts", "client/package.json", "client/package-lock.json", "scripts", "README.md"]:
                    archive.add(ROOT / relative, arcname=relative)
            with ssh.open_sftp() as sftp:
                if not frontend_only:
                    sftp.put(str(jar), f"{REMOTE}/sims-server.jar")
                sftp.put(str(frontend), f"{REMOTE}/frontend.tar.gz")
                sftp.put(str(source), f"{REMOTE}/source.tar.gz")
        if not frontend_only:
            expected = hashlib.sha256(jar.read_bytes()).hexdigest()
            actual = run(f"sha256sum {REMOTE}/sims-server.jar").split()[0]
            if actual != expected:
                raise RuntimeError("Uploaded backend checksum mismatch")
        print("Uploaded and verified release artifacts", flush=True)
        if not frontend_only:
            run(f"cp {REMOTE}/sims-server.jar /opt/sims/sims-server.jar.next && mv /opt/sims/sims-server.jar.next /opt/sims/sims-server.jar")
            switched = True
            run("systemctl restart sims-server")
        healthy = False
        for attempt in range(45):
            time.sleep(2)
            code = run("curl -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' http://127.0.0.1:8080/api/v1/auth/login || true")
            if code == "400":
                healthy = True
                break
        if not healthy:
            raise RuntimeError("Backend did not become healthy")
        schema_query = "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='sim_system_db' AND table_name='students' AND column_name='active'"
        if run(f"{database_prefix} mysql -uroot -N -B -e {shlex.quote(schema_query)}") != "1":
            raise RuntimeError("Student status schema update was not applied")
        status_query = "SELECT column_type FROM information_schema.columns WHERE table_schema='sim_system_db' AND table_name='attendance_entries' AND column_name='status'"
        status_type = run(f"{database_prefix} mysql -uroot -N -B -e {shlex.quote(status_query)}")
        if status_type.startswith("enum(") and "EXCUSED" not in status_type:
            raise RuntimeError("Attendance status schema update was not applied")
        switched = True
        run(f"tar -xzf {REMOTE}/frontend.tar.gz -C /var/www/html && nginx -t && systemctl reload nginx")
        run("curl --fail --silent http://127.0.0.1/ > /dev/null")
        print(f"Deployed release {RELEASE}; backend and frontend health checks passed", flush=True)
    except Exception:
        if switched:
            run(f"cp {BACKUP}/sims-server.jar /opt/sims/sims-server.jar; tar -xzf {BACKUP}/frontend.tar.gz -C /var/www/html; systemctl restart sims-server; systemctl reload nginx")
            print(f"Application rollback restored from {BACKUP}. Database backup retained.", flush=True)
        raise
    finally:
        ssh.close()


if __name__ == "__main__":
    main()
