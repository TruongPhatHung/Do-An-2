package com.student.quanlykho.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Table(name = "Hang_Hoa")
@Entity
public class HangHoa {
    @Id
    @Column(name = "ma_hang")
    private String maHang;

    @Column(name = "ten_hang", nullable = false)
    private String tenHang;

    @Column(name = "so_luong_ton")
    private Integer soLuongTon;

    @Column(name = "don_vi_tinh")
    private String donViTinh;

    @Column(name = "gia_nhap")
    private Double giaNhap;

    @Column(name = "gia_ban")
    private Double giaBan;

    @Column(name = "so_luong_toi_thieu")
    private Integer soLuongToiThieu = 0;

    @ManyToOne
    @JoinColumn(name = "ma_ncc")
    private NhaCungCap nhaCungCap;

    @ManyToOne
    @JoinColumn(name = "loai_hang_id")
    private LoaiHang loaiHang;

    // 🎯 1. Bọc giáp Tối thiểu
    public Integer getSoLuongToiThieu() {
        return (this.soLuongToiThieu == null) ? 0 : this.soLuongToiThieu;
    }

    // 🎯 2. Bọc giáp Tồn kho
    public Integer getSoLuongTon() {
        return (this.soLuongTon == null) ? 0 : this.soLuongTon;
    }

    // 🎯 3. Bọc giáp hàm Cảnh báo (THAY ĐỔI QUAN TRỌNG NHẤT Ở ĐÂY)
    public boolean isCanhBaoHetHang() {
        int ton = (this.soLuongTon == null) ? 0 : this.soLuongTon;
        int toiThieu = (this.soLuongToiThieu == null) ? 0 : this.soLuongToiThieu;
        return ton < toiThieu;
    }
}