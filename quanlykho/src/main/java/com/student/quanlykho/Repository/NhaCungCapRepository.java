package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.NhaCungCap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhaCungCapRepository extends JpaRepository<NhaCungCap, Long> {
    Optional<NhaCungCap> findByMaNCC(String maNCC);
    // Dùng LEFT JOIN FETCH để gom dữ liệu của 2 bảng trong 1 lần truy vấn duy nhất!
    @Query("SELECT DISTINCT n FROM NhaCungCap n LEFT JOIN FETCH n.danhSachHangHoa")
    List<NhaCungCap> findAll();

}
