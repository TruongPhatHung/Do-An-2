package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.ChiTietDonDatHang;
import com.student.quanlykho.Entity.DonDatHang;
import com.student.quanlykho.Entity.HangHoa;
import com.student.quanlykho.Entity.PhieuNhap;
import com.student.quanlykho.Repository.ChiTietDonDatHangRepository;
import com.student.quanlykho.Repository.DonDatHangRepository;
import com.student.quanlykho.Repository.HangHoaRepository;
import com.student.quanlykho.Repository.PhieuNhapRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Service

public class NhapKhoService {

    @Autowired
    private DonDatHangRepository donDatHangRepository;

    @Autowired
    private ChiTietDonDatHangRepository chiTietDonDatHangRepository;

    @Autowired
    private HangHoaRepository hangHoaRepository;

    @Autowired
    private PhieuNhapRepository phieuNhapRepository;

    @Transactional
    public PhieuNhap taoPhieuNhap(String maDonHang, Map<String, Integer> hangNhap){
        DonDatHang donDatHang = donDatHangRepository.findById((maDonHang))
                .orElseThrow(()-> new RuntimeException("Không tìm thấy đơn hàng" + maDonHang));
        // 2. Tạo phiếu nhập mới
        PhieuNhap phieuNhap = new PhieuNhap();
        phieuNhap.setMaPhieuNhap("PN-"+  System.currentTimeMillis());
        phieuNhap.setNgayNhap(LocalDateTime.now());
        phieuNhap.setDonDatHang(donDatHang);
// 3. Duyệt qua từng món hàng được nhập
        for (Map.Entry<String, Integer> entry : hangNhap.entrySet()){
            String maHang = entry.getKey();
            Integer soLuongThucNhap = entry.getValue();

            HangHoa hangHoa = hangHoaRepository.findById(maHang)
                    .orElseThrow(()-> new RuntimeException("Lỗi : Mã hàng không tồn tại"));

            ChiTietDonDatHang chiTiet =chiTietDonDatHangRepository.findByDonDatHangAndHangHoa(donDatHang, hangHoa);

            if(chiTiet != null){
                int conLai = chiTiet.getSoLuongDat() - chiTiet.getSoLuongDaNhap();
                if (soLuongThucNhap > conLai){
                    throw new RuntimeException("Lỗi : Không thể nhập quá số lượng đặt!" + conLai+ ", Nhập:" + soLuongThucNhap);
                }
                chiTiet.setSoLuongDaNhap(chiTiet.getSoLuongDaNhap()+ soLuongThucNhap);
                chiTietDonDatHangRepository.save(chiTiet);

                hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() +soLuongThucNhap);
                hangHoaRepository.save(hangHoa);
            }

        }
        capNhatTrangThaiDonHang(donDatHang);
        return phieuNhap;
    }

    private void capNhatTrangThaiDonHang(DonDatHang donDatHang){
        boolean daDuHang = true;
        for (ChiTietDonDatHang ct : donDatHang.getChiTiets()){
            if (ct.getSoLuongDaNhap() < ct.getSoLuongDat()){
                daDuHang = false;
                break;
            }
        }
        if (daDuHang){
            donDatHang.setTrangThai("Hoàn Thành");
        }
        else {
            donDatHang.setTrangThai("Giao Thiếu");
        }
        donDatHangRepository.save(donDatHang);
    }


}
