const notification = (
  toast,
  severity = "success",
  summary = "Thông báo",
  detail,
  life = 1500
) => {
  toast.add({
    severity,
    summary,
    detail,
    life,
  });
};

export default notification;
