export interface LoadingSpinnerProps {
  size?: 'sm' | 'lg'
  fullPage?: boolean
}

export function LoadingSpinner({ size = 'sm', fullPage = false }: LoadingSpinnerProps) {
  const spinnerEl = <div className={size === 'lg' ? 'spinner spinner-lg' : 'spinner'} />
  if (fullPage) {
    return <div className="spinner-page">{spinnerEl}</div>
  }
  return spinnerEl
}
