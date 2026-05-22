package com.cesizen.cesizenapi.service;

import com.cesizen.cesizenapi.dto.PageDTO;
import com.cesizen.cesizenapi.model.Page;
import com.cesizen.cesizenapi.repository.PageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PageServiceTest {

    @Mock private PageRepository pageRepository;
    @InjectMocks private PageService pageService;

    private Page page;

    @BeforeEach
    void setUp() {
        page = Page.builder()
                .id(1L)
                .titre("Accueil")
                .slug("accueil")
                .contenu("Bienvenue sur CESIZen")
                .estActif(true)
                .build();
    }

    @Test
    @DisplayName("getAllPages - doit retourner uniquement les pages actives")
    void getAllPages_shouldReturnOnlyActivePages() {
        when(pageRepository.findAllByEstActifTrue()).thenReturn(List.of(page));

        List<PageDTO> result = pageService.getAllPages();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSlug()).isEqualTo("accueil");
        verify(pageRepository).findAllByEstActifTrue();
    }

    @Test
    @DisplayName("getPageBySlug - doit retourner la page si elle existe et est active")
    void getPageBySlug_shouldReturnPageWhenFound() {
        when(pageRepository.findBySlug("accueil")).thenReturn(Optional.of(page));

        PageDTO result = pageService.getPageBySlug("accueil");

        assertThat(result.getTitre()).isEqualTo("Accueil");
        assertThat(result.getSlug()).isEqualTo("accueil");
    }

    @Test
    @DisplayName("getPageBySlug - doit lever une exception si la page est inactive")
    void getPageBySlug_shouldThrowIfPageInactive() {
        page.setEstActif(false);
        when(pageRepository.findBySlug("accueil")).thenReturn(Optional.of(page));

        assertThatThrownBy(() -> pageService.getPageBySlug("accueil"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    @DisplayName("getPageBySlug - doit lever une exception si le slug n'existe pas")
    void getPageBySlug_shouldThrowIfNotFound() {
        when(pageRepository.findBySlug("inexistant")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pageService.getPageBySlug("inexistant"))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    @DisplayName("updatePage - doit modifier et retourner la page mise à jour")
    void updatePage_shouldUpdateAndReturnPage() {
        PageDTO dto = new PageDTO();
        dto.setTitre("Accueil modifié");
        dto.setContenu("Nouveau contenu");
        dto.setEstActif(true);

        when(pageRepository.findById(1L)).thenReturn(Optional.of(page));
        when(pageRepository.save(any())).thenReturn(page);

        PageDTO result = pageService.updatePage(1L, dto);

        assertThat(result).isNotNull();
        verify(pageRepository).save(any(Page.class));
    }

    @Test
    @DisplayName("updatePage - doit lever une exception si la page n'existe pas")
    void updatePage_shouldThrowIfNotFound() {
        when(pageRepository.findById(99L)).thenReturn(Optional.empty());

        PageDTO dto = new PageDTO();
        dto.setTitre("Test");

        assertThatThrownBy(() -> pageService.updatePage(99L, dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("introuvable");
    }
}