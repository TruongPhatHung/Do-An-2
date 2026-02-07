package com.student.quanlykho.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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


    public boolean isCanhBaoHetHang(){
        return this.soLuongTon < this.soLuongToiThieu;
    }
}
