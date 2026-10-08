/**
 * Navigates to the "from" route if present, otherwise falls back to /medication-schedule.
 * Uses router.navigate to perform back/finish navigation without popping to unauthenticated root.
 */
export function goBackTo(
  router: { navigate: (href: any) => void },
  from?: string | string[] | null,
  id?: string
) {
  const target = typeof from === 'string' && from ? from : '/medication-schedule';
  if (id) {
    router.navigate({
      pathname: target as any,
      params: { id },
    });
  } else {
    router.navigate({
      pathname: target as any,
    });
  }
}
