package com.student.quanlykho.Security;

import com.student.quanlykho.Entity.NguoiDung;
import com.student.quanlykho.Repository.NguoiDungRepository;
import com.student.quanlykho.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private NguoiDungRepository nguoiDungRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            // 1. Lấy Token từ Header "Authorization"
            String jwt = getJwtFromRequest(request);

            // 2. Nếu có Token và Token đó là hàng thật (Validate thành công)
            if (StringUtils.hasText(jwt) && jwtUtils.validateToken(jwt)) {
                String username = jwtUtils.getUsernameFromJWT(jwt);

                // 1. Tìm User trong Database để lấy quyền (Vai trò)
                NguoiDung user = nguoiDungRepository.findByTenDangNhap(username).orElse(null);

                if (user != null) {
                    // 2. Chuyển đổi VaiTro (VD: "ADMIN") thành định dạng quyền của Spring Security
                    List<GrantedAuthority> authorities = new ArrayList<>();
                    authorities.add(new SimpleGrantedAuthority(user.getVaiTro()));

                    // 3. Nhét danh sách quyền (authorities) vào chứng chỉ
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            user.getTenDangNhap(), null, authorities);

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            logger.error("Không thể xác thực người dùng: " + ex.getMessage());
        }

        // Cho phép yêu cầu đi tiếp đến Controller
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Cắt bỏ chữ "Bearer " để lấy mỗi chuỗi Token
        }
        return null;
    }
}
