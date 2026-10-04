package com.sliit.sims.parent.repository;

import com.sliit.sims.parent.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Long> {

    Optional<Parent> findByNic(String nic);

    Optional<Parent> findByUserId(Long userId);

    boolean existsByNic(String nic);
}

