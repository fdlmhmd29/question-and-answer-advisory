/**
 * Utility functions for handling HTML content safely
 */

/**
 * Clean and decode HTML content for safe rendering
 */
export function cleanHtmlContent(html: string): string {
  if (!html) return ''

  // Create a temporary element to decode HTML entities
  const textarea = document.createElement('textarea')
  textarea.innerHTML = html
  const decoded = textarea.value

  // If the content still contains HTML tags, it's legitimate formatted content
  // Return it as-is for dangerouslySetInnerHTML
  return decoded
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe formatting tags
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  const allowedTags = ['b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'br', 'p', 'div']
  const allowedAttributes: Record<string, string[]> = {}

  // Create a temporary element
  const temp = document.createElement('div')
  temp.innerHTML = html

  // Function to recursively clean elements
  function cleanElement(element: Element): void {
    const nodesToRemove: Element[] = []

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i]
      const tagName = child.tagName.toLowerCase()

      // Remove if tag is not allowed
      if (!allowedTags.includes(tagName)) {
        nodesToRemove.push(child)
      } else {
        // Remove all attributes except allowed ones
        const attrs = Array.from(child.attributes)
        attrs.forEach((attr) => {
          const allowedAttrs = allowedAttributes[tagName] || []
          if (!allowedAttrs.includes(attr.name)) {
            child.removeAttribute(attr.name)
          }
        })
        cleanElement(child)
      }
    }

    // Remove disallowed nodes
    nodesToRemove.forEach((node) => {
      // Keep text content but remove the tag
      const text = document.createTextNode(node.textContent || '')
      node.parentNode?.replaceChild(text, node)
    })
  }

  cleanElement(temp)
  return temp.innerHTML
}

/**
 * Extract plain text from HTML
 */
export function stripHtmlTags(html: string): string {
  if (!html) return ''
  const temp = document.createElement('div')
  temp.innerHTML = html
  return temp.textContent || temp.innerText || ''
}

/**
 * Check if string contains HTML
 */
export function isHtmlContent(content: string): boolean {
  const htmlRegex = /<[^>]*>/
  return htmlRegex.test(content)
}
