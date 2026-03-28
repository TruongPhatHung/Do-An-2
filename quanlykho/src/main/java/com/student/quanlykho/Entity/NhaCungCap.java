package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(name = "nha_cung_cap")
public class NhaCungCap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Thêm dòng này để DB tự tăng số
    private Long id;
    @Column(name = "ma_ncc")

    private String maNCC;
    @Column(name = "ten_ncc")
    @JsonProperty("tenNCC")
    private String tenNCC;
    @Column(name = "dia_chi")
    private String diaChi;
    @Column(name = "email")
    private String email;
    @OneToMany(mappedBy = "nhaCungCap", cascade = CascadeType.ALL)
    private List<SanPhamNCC> danhSachHangHoa;
    @ManyToOne
    @JoinColumn(name = "loai_hang_id")
    private LoaiHang loaiHang;
}
