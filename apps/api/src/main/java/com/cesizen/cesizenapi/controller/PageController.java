package com.cesizen.cesizenapi.controller;

import com.cesizen.cesizenapi.dto.PageDTO;
import com.cesizen.cesizenapi.service.PageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pages")
@RequiredArgsConstructor
public class PageController {

    private final PageService pageService;

    // ─── GET /api/pages (public) ──────────────────────────────────
    @GetMapping
    public ResponseEntity<List<PageDTO>> getAllPages() {
        return ResponseEntity.ok(pageService.getAllPages());
    }

    // ─── GET /api/pages/{slug} (public) ──────────────────────────
    @GetMapping("/{slug}")
    public ResponseEntity<PageDTO> getPageBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(pageService.getPageBySlug(slug));
    }

    // ─── PUT /api/pages/{id} (admin) ─────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<PageDTO> updatePage(@PathVariable Long id,
                                              @Valid @RequestBody PageDTO dto) {
        return ResponseEntity.ok(pageService.updatePage(id, dto));
    }
}