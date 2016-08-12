//package com.clearvision.spectrum.model.tenant;
//
//import com.clearvision.spectrum.model.SimpleModel;
//
//import javax.persistence.Column;
//import javax.persistence.Entity;
//
//@Entity
//public class Product extends SimpleModel {
//    @Column(length = 128, nullable = false)
//    private String productId;
//
//    @Column
//    private Double price;
//
//    @Column(length = 255)
//    private String description;
//
//    public Product merge(Product other) {
//        this.productId = other.productId;
//        this.price = other.price;
//        this.description = other.description;
//        return this;
//    }
//
//    public String getProductId() {
//        return productId;
//    }
//
//    public void setProductId(String productId) {
//        this.productId = productId;
//    }
//
//    public Double getPrice() {
//        return price;
//    }
//
//    public void setPrice(Double price) {
//        this.price = price;
//    }
//
//    public String getDescription() {
//        return description;
//    }
//
//    public void setDescription(String description) {
//        this.description = description;
//    }
//
// }
