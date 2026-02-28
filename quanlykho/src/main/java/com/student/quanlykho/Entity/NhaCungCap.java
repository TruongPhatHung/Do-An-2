package com.student.quanlykho.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "nha_cung_cap")
public class NhaCungCap {

    @Id
    @Column(name = "ma_ncc")
    private String maNCC;
    @Column(name = "ten_ncc")
    private String tenNCC;
    @Column(name = "dia_chi")
    private String diaChi;
}
