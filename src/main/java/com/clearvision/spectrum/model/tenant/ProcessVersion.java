package com.clearvision.spectrum.model.tenant;

import com.clearvision.spectrum.model.Filterable;
import com.clearvision.spectrum.model.SimpleModel;
import org.hibernate.annotations.Type;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.Date;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"comment", "createDate", "sequence"}))
public class ProcessVersion extends SimpleModel<ProcessVersion> {

	@ManyToOne(optional = false)
	private Process process;

	@Column(length = 255)
	private String fileName;
	@Filterable
	@Column(length = 4000)
	private String comment;
	@Filterable
	@Column(length = 4000)
	private String description;
	private Timestamp createDate;
	private String createdBy;
	private Timestamp updateDate;
	private String updatedBy;
	private int sequence;
	@Column(length = 32)
	private String versionKey;
	@Lob
	@Column(length = 5 * 1024 * 1024) // 5MBytes
	private byte[] file;

	public ProcessVersion() {
	}

	public ProcessVersion(String fileName, String comment, String description, Date createDate, String createdBy, Date updateDate, String updatedBy,
	                      int sequence, String versionKey, byte[] file) {
		this.fileName = fileName;
		this.comment = comment;
		this.description = description;
		this.createDate = new Timestamp(createDate.getTime());
		this.createdBy = createdBy;
		this.updateDate = new Timestamp(updateDate.getTime());
		this.updatedBy = updatedBy;
		this.sequence = sequence;
		this.versionKey = versionKey;
		this.file = Arrays.copyOf(file, file.length);
	}

	public long getProcessId() {
		return process.getId();
	}

	public void setProcessId(long processId) {
		this.process.setId(processId);
	}

	public Process getProcess() {
		return process;
	}

	public void setProcess(Process process) {
		this.process = process;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Date getCreateDate() {
		return new Date(createDate.getTime());
	}

	public void setCreateDate(Date createDate) {
		this.createDate = new Timestamp(createDate.getTime());
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public Date getUpdateDate() {
		return new Date(updateDate.getTime());
	}

	public String getUpdatedBy() {
		return updatedBy;
	}

	public void setUpdatedBy(String updatedBy) {
		this.updatedBy = updatedBy;
	}

	public void setUpdateDate(Date updateDate) {
		this.updateDate = new Timestamp(updateDate.getTime());
	}

	public int getSequence() {
		return sequence;
	}

	public void setSequence(int sequence) {
		this.sequence = sequence;
	}

	public String getVersionKey() {
		return versionKey;
	}

	public void setVersionKey(String versionKey) {
		this.versionKey = versionKey;
	}

	@Type(type="org.hibernate.type.PrimitiveByteArrayBlobType")
	public byte[] getFile() {
		return Arrays.copyOf(file, file.length);
	}

	public void setFile(byte[] file) {
		this.file = Arrays.copyOf(file, file.length);
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
