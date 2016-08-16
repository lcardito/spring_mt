package me.lcardito.spring.dao.tenant;

import me.lcardito.spring.model.tenant.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookmarkDao extends JpaRepository<Bookmark, Long> {
//    List<Bookmark> findAllByUserId(long userId);
}
