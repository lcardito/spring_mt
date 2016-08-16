package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.SimpleModel;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table
public class Bookmark extends SimpleModel<Bookmark> {
	@ManyToOne
	private User user;

	private String link;
	private String label;

	public Bookmark() {
	}

	public Bookmark(Long id, User user, String link, String label) {
		setId(id);
		this.user = user;
		this.link = link;
		this.label = label;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	public String getLabel() {
		return label;
	}

	public void setLabel(String label) {
		this.label = label;
	}

	/**
	 * For clarity, explicitly call equals and hashcode from parent class.
	 */
	@Override
	public boolean equals(Object o) {
		return super.equals(o);
	}

	@Override
	public int hashCode() {
		return super.hashCode();
	}

}
