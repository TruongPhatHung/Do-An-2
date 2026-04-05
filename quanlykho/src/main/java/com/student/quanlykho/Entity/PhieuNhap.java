package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "phieu_nhap")
@Data
public class PhieuNhap {
    @Id
    @Column(name = "ma_phieu_nhap")
    private String maPhieuNhap; // PN-1711...

    @Column(name = "ngay_nhap")
    private LocalDateTime ngayNhap = LocalDateTime.now();

    @Column(name = "nguoi_nhap")
    private String nguoiNhap; // Tên nhân viên kho thực hiện

    @Column(name = "tong_tien")
    private Double tongTien; // Tổng giá trị lô hàng nhập về

    @ManyToOne
    @JoinColumn(name = "ma_nha_cung_cap")
    private NhaCungCap nhaCungCap;
    @Column(name = "ghi_chu", columnDefinition = "TEXT")
    private String ghiChu;
    @ManyToOne
    @JoinColumn(name = "ma_don_dat_hang")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private DonDatHang donDatHang;

    // 🎯 QUAN TRỌNG: Lưu chi tiết xem phiếu này nhập những món hàng nào
    @OneToMany(mappedBy = "phieuNhap", cascade = CascadeType.ALL)
    private List<ChiTietPhieuNhap> chiTiets;
}