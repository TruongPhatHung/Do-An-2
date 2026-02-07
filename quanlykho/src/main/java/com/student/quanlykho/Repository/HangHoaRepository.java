package com.student.quanlykho.Repository;

import com.student.quanlykho.Entity.HangHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface HangHoaRepository extends JpaRepository<HangHoa, String> {

    List<HangHoa> findBySoLuongTonLessThan(int soLuongToiThieu);
}
