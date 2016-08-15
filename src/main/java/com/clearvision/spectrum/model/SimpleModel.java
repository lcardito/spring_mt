package com.clearvision.spectrum.model;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class SimpleModel<T extends SimpleModel> {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	public SimpleModel() {
		super();
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		SimpleModel other = (SimpleModel) o;

		if (id == null || other.id == null) return false;

		return id.equals(other.id);
	}

	@Override
	public int hashCode() {
		return id == null? 0: id.hashCode();
	}
}
