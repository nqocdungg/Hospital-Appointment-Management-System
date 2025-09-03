
-- 1. Hiển thị thông tin theo từng chuyên khoa, bao gồm: Mã Chuyên Khoa, Tên Chuyên Chuyên khoa, Số lượng bác sĩ, Họ tên Trưởng Khoa. 

SELECT CK.MaChuyenKhoa, CK.TenChuyenKhoa, Count(BS.MaBacSi) AS SoLuongBS,
 	BS2.HoTen AS TenTruongKhoa
FROM ChuyenKhoa CK 
	LEFT JOIN BacSi BS ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
	LEFT JOIN BacSi BS2 ON BS2.MaBacSi = CK.MaTruongKhoa
GROUP BY CK.MaChuyenKhoa, CK.TenChuyenKhoa, BS2.HoTen
ORDER BY CK.MaChuyenKhoa;


-- 2. Hiển thị danh sách lịch làm việc của bác sĩ có mã số BS001 từ ngày 22/6/2025 đến ngày 28/6/2025. 

SELECT LLV.MaLichLamViec, LLV.NgayLamViec, LLV.MaCaKham, 
 	CK.ThoiGianBatDau, CK.ThoiGianKetThuc, LLV.TrangThaiCa
FROM LichLamViec LLV
	JOIN CaKham CK ON LLV.MaCaKham = CK.MaCaKham
WHERE LLV.MaBacSi = 'BS001'  	
	AND LLV.NgayLamViec BETWEEN '2025-06-22' AND '2025-06-28'
ORDER BY LLV.NgayLamViec, CK.ThoiGianBatDau;


-- 3. Danh sách các ca trống của bác sĩ ‘Do Van Anh’ từ ngày 27/6/2025 đến ngày 30/6/2025.

SELECT LLV.MaLichLamViec, LLV.NgayLamViec, CK.MaCaKham, CK.ThoiGianBatDau,
 	CK.ThoiGianKetThuc, LLV.TrangThaiCa
FROM BacSi BS
	JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
	JOIN CaKham CK ON CK.MaCaKham = LLV.MaCaKham
WHERE LOWER(BS.HoTen) = 'do van anh'
	AND LLV.TrangThaiCa = 0
	AND LLV.NgayLamViec BETWEEN '2025-06-27' AND '2025-06-30'
ORDER BY LLV.NgayLamViec, CK.MaCaKham;


-- 4. Tạo trigger tự động cập nhật trạng thái ca làm việc của bác sĩ khi có lịch hẹn được tạo hoặc khi lịch hẹn thay đổi trạng thái.  

CREATE OR REPLACE FUNCTION tf_update_lichlamviec_tt() RETURNS TRIGGER AS
$$
BEGIN
	IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.TrangThaiLichHen IS DISTINCT FROM OLD.TrangThaiLichHen)) THEN
		IF (NEW.TrangThaiLichHen IN (0,1)) THEN
			UPDATE LichLamViec SET TrangThaiCa = 1
			WHERE MaLichLamViec = NEW.MaLichLamViec;
		ELSIF (NEW.TrangThaiLichHen IN (2,4)) THEN
			UPDATE LichLamViec SET TrangThaiCa = 0
			WHERE MaLichLamViec = NEW.MaLichLamViec;
		END IF; 
	ELSIF (TG_OP = 'DELETE') THEN
		UPDATE LichLamViec SET TrangThaiCa = 0
		WHERE MaLichLamViec = OLD.MaLichLamViec;
	END IF;
	RETURN NULL;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tg_update_lichlamviec_tt 
AFTER UPDATE OR INSERT OR DELETE ON LichHen
FOR EACH ROW
EXECUTE PROCEDURE tf_update_lichlamviec_tt();


-- 5. Tạo view để bác sĩ xem được tất cả lịch hẹn của mình.  

CREATE OR REPLACE VIEW v_lichhen_bacsi AS
	SELECT BS.MaBacSi, LH.MaLichHen, LLV.NgayLamViec, 
       		BN.MaBenhNhan, BN.HoTen AS TenBenhNhan, CKh.ThoiGianBatDau,
 		LH.TrieuChung, LH.YeuCau, LH.GhiChu, LH.TrangThaiLichHen
	FROM LichHen LH
		JOIN LichLamViec LLV ON LH.MaLichLamViec = LLV.MaLichLamViec
		JOIN BacSi BS ON LLV.MaBacSi = BS.MaBacSi
		JOIN CaKham CKh ON CKh.MaCaKham = LLV.MaCaKham
		JOIN BenhNhan BN ON LH.MaBenhNhan = BN.MaBenhNhan
	ORDER BY LLV.NgayLamViec, CKh.ThoiGianBatDau DESC;


-- 6. In ra thông tin bác sĩ làm nhiều ca nhất trong tháng 12/2024. Thông tin hiển thị bao gồm Mã Bác sĩ, họ tên bác sĩ, tên chuyên khoa, trình độ chuyên môn và tổng số ca. 

WITH tmp AS (
	SELECT BS.MaBacSi, BS.HoTen, BS.TrinhDoChuyenMon, CK.TenChuyenKhoa,
 COUNT(*) AS TongSoCa
	FROM BacSi BS 
		JOIN ChuyenKhoa CK ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
		JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
	WHERE NgayLamViec BETWEEN '2024-12-01' AND '2024-12-31' 
AND LLV.TrangThaiCa IN (0,1)
	GROUP BY BS.MaBacSi, BS.HoTen, BS.TrinhDoChuyenMon, CK.TenChuyenKhoa
)
SELECT * 
FROM tmp
WHERE TongSoCa >= (SELECT MAX(TongSoCa) FROM tmp);

CREATE INDEX idx_llv_ngay_trangthai ON LichLamViec(NgayLamViec, TrangThaiCa);


-- 7. Tạo view hiển thị lịch sử hồ sơ khám của bệnh nhân. 

CREATE OR REPLACE VIEW v_LichSuKhamBenh AS
	SELECT BN.MaBenhNhan, BN.HoTen AS TenBenhNhan, BN.NgaySinh,
		LLV.NgayLamViec AS NgayKham, 
		BS.HoTen AS TenBacSi, CK.TenChuyenKhoa, 
		HS.ChanDoan, HS.DonThuoc, HS.GhiChu
	FROM HoSoKham HS
		JOIN LichHen LH ON HS.MaLichHen = LH.MaLichHen
		JOIN LichLamViec LLV ON LH.MaLichLamViec = LLV.MaLichLamViec
		JOIN CaKham CKh ON LLV.MaCaKham = CKh.MaCaKham
		JOIN BacSi BS ON LLV.MaBacSi = BS.MaBacSi
		JOIN ChuyenKhoa CK ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
		JOIN BenhNhan BN ON LH.MaBenhNhan = BN.MaBenhNhan;


-- 8. Xếp hạng các ca khám theo số lượng đặt lịch nhiều nhất đến ít nhất. Thông tin hiển thị bao gồm Mã ca khám, Thời gian bắt đầu, Thời gian kết thúc, và Số lượng được đặt (bao gồm lịch hẹn đã hoàn tất và lịch hẹn sắp tới).

SELECT CK.MaCaKham, CK.ThoiGianBatDau, CK.ThoiGianKetThuc,
	 COUNT(CASE WHEN LH.TrangThaiLichHen IN (0,1) THEN 1 END) 
		AS SoLuongLichHen
FROM CaKham CK 
	LEFT JOIN LichLamViec LLV ON CK.MaCaKham = LLV.MaCaKham
	LEFT JOIN LichHen LH ON LLV.MaLichLamViec = LH.MaLichLamViec
GROUP BY CK.MaCaKham, CK.ThoiGianBatDau, CK.ThoiGianKetThuc
ORDER BY SoLuongLichHen DESC;


-- 9. Xếp hạng tổng doanh thu theo chuyên khoa từ doanh thu cao đến doanh thu ít. 

WITH tmp AS (
	SELECT CK.MaChuyenKhoa, CK.TenChuyenKhoa, 
		SUM(CASE WHEN LH.TrangThaiLichHen = 1 THEN BS.PhiKhamBenh ELSE 0 END)  
			AS sum_dt
	FROM ChuyenKhoa CK
		LEFT JOIN BacSi BS ON CK.MaChuyenKhoa = BS.MaChuyenKhoa
		LEFT JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
		LEFT JOIN LichHen LH ON LLV.MaLichLamViec = LH.MaLichLamViec
	GROUP BY CK.MaChuyenKhoa, CK.TenChuyenKhoa
	ORDER BY sum_dt DESC
)
SELECT MaChuyenKhoa, TenChuyenKhoa, 
	TO_CHAR(sum_dt, 'FM999,999,999,999') || ' VND' AS TongDoanhThu
FROM tmp;


-- 10. Tạo function tính doanh thu của một bác sĩ cụ thể trong một khoảng thời gian cụ thể.

CREATE OR REPLACE FUNCTION ft_doanhthu_bacsi 
	(IN mabs_input CHAR(5), IN ngay_bat_dau DATE, IN ngay_ket_thuc DATE) 
RETURNS BIGINT AS
$$
DECLARE
	doanhthu BIGINT;
BEGIN
	SELECT 
		SUM(CASE WHEN LH.TrangThaiLichHen = 1 THEN BS.PhiKhamBenh ELSE 0 END) 
		INTO doanhthu
    FROM BacSi BS
		LEFT JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
		LEFT JOIN LichHen LH ON LH.MaLichLamViec = LLV.MaLichLamViec
    WHERE BS.MaBacSi = mabs_input
      		AND LLV.NgayLamViec BETWEEN ngay_bat_dau AND ngay_ket_thuc;
	IF doanhthu IS NULL THEN
		doanhthu = 0;
	END IF; 
   	RETURN doanhthu;
END;
$$ 
LANGUAGE plpgsql;


-- 11. Thống kê mức sử dụng ca làm việc theo từng bác sĩ trong tháng 12 năm 2024. Thông tin bao gồm: Mã bác sĩ, Họ tên, Chuyên khoa, Tổng số ca làm việc đã được phân công trong tháng, Tỉ lệ số ca được sử dụng (các ca được đặt trước hoặc hoàn thành khám - tương ứng trạng thái “Bận”), Tỉ lệ số ca trống (bao gồm các ca bị bệnh nhân hủy/vắng mặt hoặc các ca chưa từng được đặt - tương ứng trạng thái “Rảnh”), Tỉ lệ số ca nghỉ. 

WITH tmp AS (
	SELECT BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa, 
		COUNT(LLV.MaLichLamViec) AS TongSoCa_PhanCong, 
		SUM(CASE WHEN LLV.TrangThaiCa = 1 THEN 1 ELSE 0 END) AS SoCaSuDung, 
		SUM(CASE WHEN LLV.TrangThaiCa = 0 THEN 1 ELSE 0 END) AS SoCaTrong,  
		SUM(CASE WHEN LLV.TrangThaiCa =2 THEN 1 ELSE 0 END) AS SoCaNghi
	FROM BacSi BS 
			JOIN ChuyenKhoa CK ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
			JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
	WHERE EXTRACT(YEAR FROM LLV.NgayLamViec) = 2024 
			AND EXTRACT (MONTH FROM LLV.NgayLamViec) = 12
	GROUP BY BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa
	ORDER BY TenChuyenKhoa, HoTen
)		
SELECT MaBacSi, HoTen, TenChuyenKhoa, TongSoCa_PhanCong, 
	ROUND(100.0 * SoCaSuDung / NULLIF(TongSoCa_PhanCong,0), 2) 
		AS TiLeCaSuDung, 
	ROUND(100.0 * SoCaTrong / NULLIF(TongSoCa_PhanCong,0), 2) AS TiLeCaTrong, 
	ROUND(100.0 * SoCaNghi / NULLIF(TongSoCa_PhanCong,0), 2) AS TiLeCaNghi
FROM tmp;


-- 12. Thống kê lịch hẹn theo từng bác sĩ trong tháng 12 năm 2024. Thông tin bao gồm tỉ lệ lịch được đặt (chưa hoàn tất), tỉ lệ hoàn tất lịch hẹn, tỉ lệ lịch bị hủy.

WITH tmp AS (
	SELECT BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa, 
		COUNT(LH.MaLichHen) AS TongSoLichHen, 
		SUM(CASE WHEN LH.TrangThaiLichHen = 0 THEN 1 ELSE 0 END) 
														AS SoLichDaDat, 
		SUM(CASE WHEN LH.TrangThaiLichHen = 1 THEN 1 ELSE 0 END) 
														AS SoLichDaHoanThanh,  
		SUM(CASE WHEN LH.TrangThaiLichHen IN (2,3) THEN 1 ELSE 0 END) 
														AS SoLichBiHuy, 
		SUM(CASE WHEN LH.TrangThaiLichHen = 4 THEN 1 ELSE 0 END) 
														AS SoLichVangMat
	FROM BacSi BS 
		JOIN ChuyenKhoa CK ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
		LEFT JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
		LEFT JOIN LichHen LH ON LLV.MaLichLamViec = LH.MaLichLamViec
	WHERE LLV.NgayLamViec BETWEEN '2024-12-01' AND '2024-12-31'
	GROUP BY BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa
	ORDER BY TenChuyenKhoa, BS.HoTen
)		
SELECT MaBacSi, HoTen, TenChuyenKhoa, TongSoLichHen, 
	ROUND(100.0 * SoLichDaDat / NULLIF(TongSoLichHen,0), 2) AS TiLeDaDat, 
	ROUND(100.0 * SoLichDaHoanThanh / NULLIF(TongSoLichHen,0), 2) 
																AS TiLeHoanThanh, 
	ROUND(100.0 * SoLichBiHuy / NULLIF(TongSoLichHen,0), 2) AS TiLeHuy, 
	ROUND(100.0 * SoLichVangMat / NULLIF(TongSoLichHen,0), 2) AS TiLeVangMat
FROM tmp;


-- 13. Thống kê doanh thu theo từng bác sĩ trong tháng 12 năm 2024.

SELECT BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa, 
		COUNT(LH.MaLichHen) AS TongSoLichHen,
  		COUNT(*) FILTER (WHERE LH.TrangThaiLichHen = 1) AS SoLichHoanTat,
  		TO_CHAR(
    SUM(CASE WHEN LH.TrangThaiLichHen = 1 THEN BS.PhiKhamBenh ELSE 0 END),
    'FM999,999,999') || ' VND' AS TongDoanhThu
FROM BacSi BS
	LEFT JOIN ChuyenKhoa CK ON BS.MaChuyenKhoa = CK.MaChuyenKhoa
	LEFT JOIN LichLamViec LLV ON BS.MaBacSi = LLV.MaBacSi
	LEFT JOIN LichHen LH ON LH.MaLichLamViec = LLV.MaLichLamViec
	WHERE LLV.NgayLamViec BETWEEN '2024-12-01' AND '2024-12-31'
GROUP BY BS.MaBacSi, BS.HoTen, CK.TenChuyenKhoa
ORDER BY SUM(CASE WHEN LH.TrangThaiLichHen = 1 
				THEN BS.PhiKhamBenh ELSE 0 END) DESC;


