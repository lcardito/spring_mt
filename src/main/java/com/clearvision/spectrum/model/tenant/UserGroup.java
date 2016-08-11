package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.AssociationOverride;
import javax.persistence.AssociationOverrides;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.Transient;
import java.io.Serializable;

@Entity
@AssociationOverrides({
		               @AssociationOverride(name = "pk.user", joinColumns = @JoinColumn(name = "UserId")),
		               @AssociationOverride(name = "pk.group", joinColumns = @JoinColumn(name = "GroupId"))})
public class UserGroup extends SimpleModel<UserGroup> {

	public UserGroup(){
		super();
	}

	@EmbeddedId
	public UserGroupId getPk() {
		return pk;
	}

	public void setPk(UserGroupId pk) {
		this.pk = pk;
	}

	@Transient
	public User getUser() {
		return getPk().getUser();
	}

	public void setUser(User user) {
		getPk().setUser(user);
	}

	@Transient
	public Group getGroup() {
		return getPk().getGroup();
	}

	public void setGroup(Group group) {
		getPk().setGroup(group);
	}

	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;

		UserGroup that = (UserGroup) o;

		return !(getPk() != null ? !getPk().equals(that.getPk())
				: that.getPk() != null);

	}

	public int hashCode() {
		return (getPk() != null ? getPk().hashCode() : 0);
	}

}
