package me.lcardito.spring.model.tenant;

import me.lcardito.spring.model.Filterable;
import me.lcardito.spring.model.SimpleModel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "CVUser") //TODO CHANGE THIS
public class User extends SimpleModel implements UserDetails {
	@Filterable
	private String name;
	private String password;

	@Column(name = "cvRole") //TODO CHANGE THIS
	private Role role;

	private String email;
	private boolean isExternal;
	private long syncCycle;
	private boolean isDeleted;
	private boolean isActive;

	@Filterable
	private String firstName;

	@Filterable
	private String lastName;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_group",
            joinColumns = @JoinColumn(name = "userId"),
            inverseJoinColumns = @JoinColumn(name = "groupId"))
    private Set<Group> groups = new HashSet<>();


	public User() {
	}

	public User(Long id) {
		setId(id);
	}

	public User(Long id, String name, String password, Role role, String email, boolean isExternal, long synCycle,
                boolean isDeleted, boolean isActive, String firstName, String lastName) {
		setId(id);
		this.name = name;
		this.password = password;
		this.role = role;
		this.email = email;
		this.setExternal(isExternal);
		this.syncCycle = synCycle;
		this.isDeleted = isDeleted;
		this.isActive = isActive;
		this.firstName = firstName;
		this.lastName = lastName;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    public String getPassword() {
		return password;
	}

    @Override
    public String getUsername() {
        return name;
    }

    @Override
    public boolean isAccountNonExpired() {
        return isActive;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return isActive;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    public void setPassword(String password) {
		this.password = password;
	}

	@Enumerated(EnumType.ORDINAL)
	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	Set<Group> getUserGroups() {
		return this.groups;
	}

	public boolean isExternal() {
		return isExternal;
	}

	public void setExternal(boolean isExternal) {
		this.isExternal = isExternal;
	}

	public long getSynCycle() {
		return syncCycle;
	}

	public void setSynCycle(long synCycle) {
		this.syncCycle = synCycle;
	}

	public boolean isDeleted() {
		return isDeleted;
	}

	public void setDeleted(boolean isDeleted) {
		this.isDeleted = isDeleted;
	}

	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}
	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	@Override
	public boolean equals(Object o) {
		return super.equals(o);
	}

	@Override
	public int hashCode() {
		return super.hashCode();
	}
}
