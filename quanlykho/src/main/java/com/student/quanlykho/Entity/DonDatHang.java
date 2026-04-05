package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "don_dat_hang")
public class DonDatHang {
    @Id
    @Column(name = "ma_don")
    private String maDon;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Column(name = "trang_thai")
    private String trangThai;

    @ManyToOne
    @JoinColumn(name = "ma_ncc")
    private NhaCungCap nhaCungCap;

    @OneToMany(mappedBy = "donDatHang", cascade = CascadeType.ALL)
    private List<ChiTietDonDatHang> chiTiets;
    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;

    @OneToMany(mappedBy = "donDatHang")
    private List<PhieuNhap> donDatHang;
    @Column(name = "ngay_du_kien_giao")
    private LocalDate ngayDuKienGiao;
}
