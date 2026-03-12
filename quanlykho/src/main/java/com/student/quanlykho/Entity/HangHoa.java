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
    private int  soLuongTon;
   @Column(name = "don_vi_tinh")
    private String donViTinh;

   @Column(name = "gia_nhap")
    private Double giaNhap;

   @Column(name = "so_luong_toi_thieu")
    private int soLuongToiThieu;
    @ManyToOne
    @JoinColumn(name = "ma_ncc")
    private NhaCungCap nhaCungCap;


    public boolean isCanhBaoHetHang(){
        return this.soLuongTon < this.soLuongToiThieu;
    }
}
