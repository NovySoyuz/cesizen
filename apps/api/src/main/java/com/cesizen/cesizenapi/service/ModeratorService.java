package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.*;
import com.cesizen.cesizenapi.model.*;
import com.cesizen.cesizenapi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ModeratorService {

    private final QuestionnaireRepository questionnaireRepository;
    private final QuestionRepository questionRepository;
    private final OptionReponseRepository optionReponseRepository;

    // ─── Récupère toutes les questions d'un questionnaire (avec options) ─
    @Transactional(readOnly = true)
    public QuestionnaireDTO getQuestionnaireAdmin(Long questionnaireId) {
        Questionnaire q = questionnaireRepository.findById(questionnaireId)
                .orElseThrow(() -> new RuntimeException("Questionnaire introuvable"));

        QuestionnaireDTO dto = new QuestionnaireDTO();
        dto.setId(q.getId());
        dto.setTitre(q.getTitre());
        dto.setDescription(q.getDescription());
        dto.setQuestions(q.getQuestions().stream().map(this::toQuestionDTO).toList());
        return dto;
    }

    // ─── Crée une question avec ses options ──────────────────────────
    @Transactional
    public QuestionDTO createQuestion(Long questionnaireId, QuestionRequestDTO request) {
        Questionnaire questionnaire = questionnaireRepository.findById(questionnaireId)
                .orElseThrow(() -> new RuntimeException("Questionnaire introuvable"));

        Question question = new Question();
        question.setLibelle(request.getLibelle());
        question.setOrdre(request.getOrdre() != null ? request.getOrdre() :
                (questionRepository.findAllByQuestionnaireIdOrderByOrdreAsc(questionnaireId).size() + 1));
        question.setQuestionnaire(questionnaire);

        question = questionRepository.save(question);

        if (request.getOptions() != null) {
            List<OptionReponse> options = new ArrayList<>();
            for (OptionReponseRequestDTO optReq : request.getOptions()) {
                OptionReponse opt = new OptionReponse();
                opt.setLibelle(optReq.getLibelle());
                opt.setPoints(optReq.getPoints());
                opt.setQuestion(question);
                options.add(optionReponseRepository.save(opt));
            }
            question.setOptions(options);
        }

        return toQuestionDTO(question);
    }

    // ─── Met à jour une question et ses options ───────────────────────
    @Transactional
    public QuestionDTO updateQuestion(Long questionId, QuestionRequestDTO request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question introuvable"));

        if (request.getLibelle() != null) question.setLibelle(request.getLibelle());
        if (request.getOrdre() != null) question.setOrdre(request.getOrdre());

        question = questionRepository.save(question);

        // Met à jour les options si fournies
        if (request.getOptions() != null && question.getOptions() != null) {
            List<OptionReponse> options = question.getOptions();
            List<OptionReponseRequestDTO> optRequests = request.getOptions();
            for (int i = 0; i < Math.min(options.size(), optRequests.size()); i++) {
                OptionReponse opt = options.get(i);
                OptionReponseRequestDTO optReq = optRequests.get(i);
                if (optReq.getLibelle() != null) opt.setLibelle(optReq.getLibelle());
                if (optReq.getPoints() != null) opt.setPoints(optReq.getPoints());
                optionReponseRepository.save(opt);
            }
        }

        return toQuestionDTO(question);
    }

    // ─── Met à jour uniquement les points d'une option ───────────────
    @Transactional
    public OptionReponseDTO updateOption(Long optionId, OptionReponseRequestDTO request) {
        OptionReponse opt = optionReponseRepository.findById(optionId)
                .orElseThrow(() -> new RuntimeException("Option introuvable"));

        if (request.getLibelle() != null) opt.setLibelle(request.getLibelle());
        if (request.getPoints() != null) opt.setPoints(request.getPoints());

        opt = optionReponseRepository.save(opt);

        OptionReponseDTO dto = new OptionReponseDTO();
        dto.setId(opt.getId());
        dto.setLibelle(opt.getLibelle());
        dto.setPoints(opt.getPoints());
        return dto;
    }

    // ─── Supprime une question ────────────────────────────────────────
    @Transactional
    public void deleteQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new RuntimeException("Question introuvable");
        }
        questionRepository.deleteById(questionId);
    }

    // ─── Helper de mapping ────────────────────────────────────────────
    private QuestionDTO toQuestionDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setLibelle(question.getLibelle());
        dto.setOrdre(question.getOrdre());
        if (question.getOptions() != null) {
            dto.setOptions(question.getOptions().stream().map(opt -> {
                OptionReponseDTO oDto = new OptionReponseDTO();
                oDto.setId(opt.getId());
                oDto.setLibelle(opt.getLibelle());
                oDto.setPoints(opt.getPoints());
                return oDto;
            }).toList());
        }
        return dto;
    }
}

