package com.clearvision.spectrum.dao.tenant;

import com.clearvision.spectrum.model.tenant.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookmarkDao extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findAllByUserId(long userId);
}