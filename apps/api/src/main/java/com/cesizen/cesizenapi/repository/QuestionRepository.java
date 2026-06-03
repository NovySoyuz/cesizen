package com.cesizen.cesizenapi.repository;

import com.cesizen.cesizenapi.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findAllByQuestionnaireIdOrderByOrdreAsc(Long questionnaireId);
}

