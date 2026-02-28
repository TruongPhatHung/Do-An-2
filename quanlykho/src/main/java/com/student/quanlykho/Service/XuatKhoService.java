package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.ChiTietPhieuXuat;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuXuat;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuXuatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class XuatKhoService {
    @Autowired
    private HangHoaRepository hangHoaRepository;
    @Autowired
    private PhieuXuatRepository phieuXuatRepository;

    @Transactional
    public PhieuXuat taoPhieuXuat(String lyDo, Map<String, Integer> hangXuat){


        PhieuXuat phieuXuat= new PhieuXuat();
        phieuXuat.setMaPhieuXuat("PX-" + System.currentTimeMillis());
        phieuXuat.setLyDoXuat(lyDo);
        phieuXuat.setNgayXuat(LocalDateTime.now());

        List<ChiTietPhieuXuat> listChiTiet = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : hangXuat.entrySet()){
            String maHang = entry.getKey();
            Integer soLuongMuonXuat = entry.getValue();

            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow( ()-> new RuntimeException("Lỗi: Mã hàng không tồn tại" + maHang));
            if (hangHoa.getSoLuongTon()<soLuongMuonXuat){
                throw new RuntimeException("Lỗi: Hàng " + hangHoa.getTenHang() +
                                            " chỉ còn " + hangHoa.getSoLuongTon() +
                                            ", không đủ để xuất " + soLuongMuonXuat);
            }
            hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() - soLuongMuonXuat);
            hangHoaRepository.save(hangHoa);


            ChiTietPhieuXuat ct = new ChiTietPhieuXuat();
            ct.setPhieuXuat(phieuXuat);
            ct.setHangHoa(hangHoa);
            ct.setSoLuongXuat(soLuongMuonXuat);
            listChiTiet.add(ct);
        }
        phieuXuat.setChiTiets(listChiTiet);
        return phieuXuatRepository.save(phieuXuat);
    }
}
