package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.PageDTO;
import com.cesizen.cesizenapi.model.Page;
import com.cesizen.cesizenapi.repository.PageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PageService {

    private final PageRepository pageRepository;

    // ─── Liste toutes les pages actives (public) ──────────────────
    public List<PageDTO> getAllPages() {
        return pageRepository.findAllByEstActifTrue()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ─── Liste toutes les pages (admin) ──────────────────────────
    public List<PageDTO> getAllPagesAdmin() {
        return pageRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    // ─── Récupère une page par son slug (public) ──────────────────
    public PageDTO getPageBySlug(String slug) {
        Page page = pageRepository.findBySlug(slug)
                .filter(Page::isEstActif)
                .orElseThrow(() -> new RuntimeException("Page introuvable : " + slug));
        return toDto(page);
    }

    // ─── Crée une nouvelle page (admin) ───────────────────────────
    public PageDTO createPage(PageDTO dto) {
        // Génère le slug depuis le titre si absent
        String slug = dto.getSlug() != null && !dto.getSlug().isBlank()
                ? dto.getSlug()
                : dto.getTitre().toLowerCase()
                    .replaceAll("[àâä]", "a")
                    .replaceAll("[éèêë]", "e")
                    .replaceAll("[îï]", "i")
                    .replaceAll("[ôö]", "o")
                    .replaceAll("[ùûü]", "u")
                    .replaceAll("[^a-z0-9]+", "-")
                    .replaceAll("^-|-$", "");

        Page page = Page.builder()
                .titre(dto.getTitre())
                .slug(slug)
                .contenu(dto.getContenu())
                .estActif(dto.isEstActif())
                .build();

        pageRepository.save(page);
        return toDto(page);
    }

    // ─── Met à jour une page (admin) ──────────────────────────────
    public PageDTO updatePage(Long id, PageDTO dto) {
        Page page = pageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Page introuvable : " + id));

        page.setTitre(dto.getTitre());
        page.setContenu(dto.getContenu());
        page.setEstActif(dto.isEstActif());

        pageRepository.save(page);
        return toDto(page);
    }

    // ─── Convertit entité → DTO ───────────────────────────────────
    private PageDTO toDto(Page page) {
        PageDTO dto = new PageDTO();
        dto.setId(page.getId());
        dto.setTitre(page.getTitre());
        dto.setSlug(page.getSlug());
        dto.setContenu(page.getContenu());
        dto.setEstActif(page.isEstActif());
        return dto;
    }
}