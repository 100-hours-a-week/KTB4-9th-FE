// 종을 옮길 수 있다고 처음 한 번 알려주는 말풍선
export default function NotificationHint({ placement }) {
  const { anchorRight, above, x, y } = placement;
  return (
    <div
      role="status"
      className="cosmos-notice pointer-events-none fixed z-[91] whitespace-nowrap rounded-xl px-3 py-2 text-xs"
      style={{ [anchorRight ? "right" : "left"]: x, [above ? "bottom" : "top"]: y }}
    >
      드래그해서 옮길 수 있어요
      <span
        aria-hidden="true"
        className="cosmos-notice-tail absolute h-2.5 w-2.5 rotate-45"
        style={{
          [anchorRight ? "right" : "left"]: 17,
          [above ? "bottom" : "top"]: -6,
          borderWidth: above ? "0 1px 1px 0" : "1px 0 0 1px",
        }}
      />
    </div>
  );
}
