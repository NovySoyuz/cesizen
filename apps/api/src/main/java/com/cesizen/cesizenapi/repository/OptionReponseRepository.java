package com.cesizen.cesizenapi.repository;

import com.cesizen.cesizenapi.model.OptionReponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OptionReponseRepository extends JpaRepository<OptionReponse, Long> {
}