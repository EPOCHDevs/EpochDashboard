import { RefObject, useEffect } from "react"

const useOverlay = (
  suggestionsRef: RefObject<HTMLDivElement>,
  setter: (state: boolean) => void,
  inputRef: RefObject<HTMLDivElement | HTMLButtonElement>
) => {
  useEffect(() => {
    const handleClickOutside = (event: { target: Node | null }) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setter(false)
      }
    }

    document.addEventListener("mousedown", (props) =>
      handleClickOutside(props as unknown as { target: Node | null })
    )
    return () => {
      document.removeEventListener("mousedown", (props) =>
        handleClickOutside(props as unknown as { target: Node | null })
      )
    }
  }, [suggestionsRef, setter, inputRef])
}

export default useOverlay
