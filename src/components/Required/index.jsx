import { Modal, Button } from "antd";
import { FiLogIn } from "react-icons/fi";
import canhbaoImg from "../../assets/canhbao.png";
import { useNavigate } from "react-router-dom";

export default function RequiredLoginModal({ openLoginModal, setOpenLoginModal }) {
  const navigate = useNavigate();

  const handleLoginOk = () => {
    setOpenLoginModal(false);
    navigate("/dang-nhap");
  };

  const handleCancel = () => {
    setOpenLoginModal(false);
  };

  return (
    <Modal
      title={
        <span style={{ color: "#cc0909", fontWeight: "bold", fontSize: "22px", textAlign: "center", display: "block" }}>
          YÊU CẦU ĐĂNG NHẬP
        </span>
      }
      open={openLoginModal}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button key="login" type="primary" icon={<FiLogIn />} onClick={handleLoginOk}>
        </Button>,
      ]}
      className="enhanced-modal"
    >
      <img
        src={canhbaoImg}
        alt="login"
        style={{
          width: "100%",
          height: "350px",
          marginBottom: "10px",
          objectFit: "cover",
        }}
      />
      <p>
        Có vẻ như bạn chưa đăng nhập. Hãy đăng nhập ngay để sử dụng đầy đủ các
        tiện ích và dịch vụ mà chúng tôi cung cấp nhé!
      </p>
    </Modal>
  );
}