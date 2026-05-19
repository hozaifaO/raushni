import { fireEvent, render, screen } from "@testing-library/react";
import MemberList from "./MemberList";
import type { Member } from "@/types/models/member";

const member: Member = {
  id: "member-1",
  full_name: "Aisha Khan",
  email: "aisha@example.org",
  phone: "+91 9876543210",
  role: "Volunteer",
  status: "active",
  joined_on: "2026-05-17",
  address: "Hyderabad",
  emergency_contact: "+91 9000000000",
  notes: "Weekend education program coordinator",
  created_at: "2026-05-17T10:00:00Z",
  updated_at: "2026-05-17T10:00:00Z",
};

describe("MemberList", () => {
  it("renders member rows and exposes edit/delete actions", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();

    render(<MemberList members={[member]} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText("Aisha Khan")).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();
    expect(screen.getByText("Volunteer")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Edit Aisha Khan"));
    fireEvent.click(screen.getByLabelText("Delete Aisha Khan"));

    expect(onEdit).toHaveBeenCalledWith(member);
    expect(onDelete).toHaveBeenCalledWith(member);
  });

  it("shows an empty state when no members match", () => {
    render(<MemberList members={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("No members found")).toBeInTheDocument();
  });

  it("hides edit/delete actions for read-only users", () => {
    render(<MemberList members={[member]} readOnly onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("Aisha Khan")).toBeInTheDocument();
    expect(screen.queryByLabelText("Edit Aisha Khan")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Delete Aisha Khan")).not.toBeInTheDocument();
  });
});
