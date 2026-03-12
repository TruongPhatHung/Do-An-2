package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "nha_cung_cap")
public class NhaCungCap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Thêm dòng này để DB tự tăng số
    private Long id;
    @Column(name = "ma_ncc")
    @JsonProperty("maNCC")
    private String maNCC;
    @Column(name = "ten_ncc")
    @JsonProperty("tenNCC")
    private String tenNCC;
    @Column(name = "dia_chi")
    private String diaChi;
}
