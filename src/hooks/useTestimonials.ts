import { useQuery } from "@tanstack/react-query";
import { listAllTestimonials, listApprovedTestimonials } from "@/services/testimonialService";

export const testimonialKeys = {
  approved: ["testimonials", "approved"] as const,
  all: ["testimonials", "all"] as const,
};

export function useTestimonials() {
  return useQuery({
    queryKey: testimonialKeys.approved,
    queryFn: listApprovedTestimonials,
    staleTime: 5 * 60_000,
  });
}

export function useAdminTestimonials() {
  return useQuery({ queryKey: testimonialKeys.all, queryFn: listAllTestimonials });
}
