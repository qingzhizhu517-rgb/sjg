package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/** 民间文学扩展表(V14) */
@TableName("literature_detail")
public class LiteratureDetail {
    @TableId(type = IdType.INPUT)
    private Long itemId;
    private String genre;
    private String originRegion;
    private String mainCharacters;
    private String plotSummary;
    private String culturalSignificance;
    private String relatedScenicSpots;
    private String collectionSource;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getGenre() { return genre; }
    public void setGenre(String v) { this.genre = v; }
    public String getOriginRegion() { return originRegion; }
    public void setOriginRegion(String v) { this.originRegion = v; }
    public String getMainCharacters() { return mainCharacters; }
    public void setMainCharacters(String v) { this.mainCharacters = v; }
    public String getPlotSummary() { return plotSummary; }
    public void setPlotSummary(String v) { this.plotSummary = v; }
    public String getCulturalSignificance() { return culturalSignificance; }
    public void setCulturalSignificance(String v) { this.culturalSignificance = v; }
    public String getRelatedScenicSpots() { return relatedScenicSpots; }
    public void setRelatedScenicSpots(String v) { this.relatedScenicSpots = v; }
    public String getCollectionSource() { return collectionSource; }
    public void setCollectionSource(String v) { this.collectionSource = v; }
}