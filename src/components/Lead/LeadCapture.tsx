import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Send } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useConversationStore } from '@/store/conversation-store'
import type { LeadData } from '@/types'

export function LeadCapture() {
  const { setLeadData } = useConversationStore()
  const [formData, setFormData] = useState<LeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    interest: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (field: keyof LeadData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    setLeadData(formData)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <Card variant="glass" glow="green">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Thank you, {formData.name}!
          </h3>
          <p className="text-slate-400">
            Your information has been captured. We'll be in touch soon.
          </p>
        </motion.div>
      </Card>
    )
  }

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-blue-400" />
        </div>
        <CardTitle>Complete Your Information</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                placeholder="john@company.com"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="Company"
              placeholder="Acme Inc."
              value={formData.company || ''}
              onChange={(e) => handleChange('company', e.target.value)}
            />
          </div>

          <Input
            label="What are you interested in?"
            placeholder="Branding, web design, marketing strategy..."
            value={formData.interest || ''}
            onChange={(e) => handleChange('interest', e.target.value)}
          />

          <Button 
            type="submit" 
            className="w-full" 
            glow
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Information
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
