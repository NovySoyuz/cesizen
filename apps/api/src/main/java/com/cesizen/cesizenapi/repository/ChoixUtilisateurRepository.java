package com.cesizen.cesizenapi.repository;

import com.cesizen.cesizenapi.model.ChoixUtilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChoixUtilisateurRepository extends JpaRepository<ChoixUtilisateur, Long> {

    @Modifying
    @Query("DELETE FROM ChoixUtilisateur c WHERE c.option.id IN :optionIds")
    void deleteByOptionIds(@Param("optionIds") List<Long> optionIds);
}

