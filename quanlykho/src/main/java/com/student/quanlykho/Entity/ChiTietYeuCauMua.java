package com.student.quanlykho.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "chi_tiet_yeu_cau_mua")
@Data
public class ChiTietYeuCauMua {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ma_yeu_cau", nullable = false)
    @JsonBackReference // 🎯 Chốt chặn vòng lặp JSON vô hạn
    private YeuCauMuaHang yeuCauMuaHang;

    @ManyToOne
    @JoinColumn(name = "ma_hang", nullable = false)
    private HangHoa hangHoa;

    @Column(name = "so_luong_can_mua", nullable = false)
    private Integer soLuongCanMua;

    // Lưu ý: KHÔNG CẦN CỘT ĐƠN GIÁ Ở ĐÂY.
    // Vì Quản lý kho chỉ báo "Kho đang thiếu 10 cái Tivi",
    // Việc khảo giá, trả giá là việc của thằng Mua Hàng lúc nó làm POForm.
}