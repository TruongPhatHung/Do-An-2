package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "san_pham_ncc")
@Data
public class SanPhamNCC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ma_hang")
    private String maHang;

    @Column(name = "ten_hang")
    private String tenHang;

    @Column(name = "gia_ban")
    private Double giaBan;

    @ManyToOne
    @JoinColumn(name = "nha_cung_cap_id")
    @JsonIgnore
    private NhaCungCap nhaCungCap;
}