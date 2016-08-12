package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.SimpleModel;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.ManyToOne;

@Entity
public class Credentials extends SimpleModel<Credentials> {

    @ManyToOne(optional=true,cascade= CascadeType.ALL)
    private User user;

    @Column(name = "name")
    private String name;

    @Column(name = "data")
    private String data;

    @Column(name="type")
    private String type;

    public Credentials(String type,String name, String data){
        this.name = name;
        this.data=data;
        this.type=type;
    }

    public Credentials(){}

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
