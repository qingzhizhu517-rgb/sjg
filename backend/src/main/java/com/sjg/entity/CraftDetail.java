package com.sjg.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

/** 非遗工艺扩展表(V13) */
@TableName("craft_detail")
public class CraftDetail {
    @TableId(type = IdType.INPUT)
    private Long itemId;
    private String craftCategory;
    private String materials;
    private String tools;
    private String process;
    private String inheritors;
    private String representativeWorks;
    private Integer difficultyLevel;
    private String learningResources;

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    public String getCraftCategory() { return craftCategory; }
    public void setCraftCategory(String v) { this.craftCategory = v; }
    public String getMaterials() { return materials; }
    public void setMaterials(String v) { this.materials = v; }
    public String getTools() { return tools; }
    public void setTools(String v) { this.tools = v; }
    public String getProcess() { return process; }
    public void setProcess(String v) { this.process = v; }
    public String getInheritors() { return inheritors; }
    public void setInheritors(String v) { this.inheritors = v; }
    public String getRepresentativeWorks() { return representativeWorks; }
    public void setRepresentativeWorks(String v) { this.representativeWorks = v; }
    public Integer getDifficultyLevel() { return difficultyLevel; }
    public void setDifficultyLevel(Integer v) { this.difficultyLevel = v; }
    public String getLearningResources() { return learningResources; }
    public void setLearningResources(String v) { this.learningResources = v; }
}