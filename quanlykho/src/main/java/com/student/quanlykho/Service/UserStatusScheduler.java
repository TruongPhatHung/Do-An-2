package com.student.quanlykho.Service;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserStatusScheduler {

    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    // Chạy ngầm 5 phút một lần (300000 ms)
    @Scheduled(fixedRate = 300000)
    public void checkOfflineUsers() {
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(15); // Quá 15p ko gọi API -> Tắt đèn

        // Lấy danh sách đang Online
        List<NguoiDung> onlineUsers = nguoiDungRepository.findAll().stream()
                .filter(u -> u.getIsOnline() != null && u.getIsOnline())
                .toList();

        for (NguoiDung user : onlineUsers) {
            if (user.getLastActiveTime() != null && user.getLastActiveTime().isBefore(timeLimit)) {
                user.setIsOnline(false); // Cúp cầu dao
                nguoiDungRepository.save(user);
            }
        }
    }
}