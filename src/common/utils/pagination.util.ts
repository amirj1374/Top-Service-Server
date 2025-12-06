export function createPaginatedResponse<T>(
  content: T[],
  totalElements: number,
  page: number,
  size: number,
) {
  return {
    content,
    page: {
      size,
      number: page,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
    },
  };
}

