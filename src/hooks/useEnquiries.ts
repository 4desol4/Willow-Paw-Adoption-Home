import { useQuery } from "@tanstack/react-query";
import { listEnquiries } from "@/services/enquiryService";

export const enquiryKeys = { all: ["enquiries"] as const };

export function useEnquiries() {
  return useQuery({ queryKey: enquiryKeys.all, queryFn: listEnquiries });
}
