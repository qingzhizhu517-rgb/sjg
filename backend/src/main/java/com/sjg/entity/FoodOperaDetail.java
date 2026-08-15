package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/** 饮食戏曲扩展表(V15) */
@TableName("food_opera_detail")
public class FoodOperaDetail {
    @TableId(type = IdType.INPUT)
    private Long itemId;
    private String subCategory;
    private String cuisineType;
    private String ingredients;
    private String preparationMethod;
    private String representativeDishes;
    private String historicalOrigin;
    private String currentStatus;
    private String preservationLevel;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String v) { this.subCategory = v; }
    public String getCuisineType() { return cuisineType; }
    public void setCuisineType(String v) { this.cuisineType = v; }
    public String getIngredients() { return ingredients; }
    public void setIngredients(String v) { this.ingredients = v; }
    public String getPreparationMethod() { return preparationMethod; }
    public void setPreparationMethod(String v) { this.preparationMethod = v; }
    public String getRepresentativeDishes() { return representativeDishes; }
    public void setRepresentativeDishes(String v) { this.representativeDishes = v; }
    public String getHistoricalOrigin() { return historicalOrigin; }
    public void setHistoricalOrigin(String v) { this.historicalOrigin = v; }
    public String getCurrentStatus() { return currentStatus; }
    public void setCurrentStatus(String v) { this.currentStatus = v; }
    public String getPreservationLevel() { return preservationLevel; }
    public void setPreservationLevel(String v) { this.preservationLevel = v; }
}