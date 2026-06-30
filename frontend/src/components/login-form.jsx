import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({ className, ...props }) {
  // استفاده از useState به شکل صحیح
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* فرم اصلی */}
          <form className="p-6 md:p-8" onSubmit={(e) => e.preventDefault()}>
            {step === 1 ? (
               // محتوای مرحله اول (ایمیل)
               <div className="grid gap-4">
                 <div className="grid gap-2">
                   <Label htmlFor="email">ایمیل</Label>
                   <Input 
                     id="email" 
                     type="email"
                     placeholder="m@example.com"
                     value={email} 
                     onChange={(e) => setEmail(e.target.value)} 
                   />
                 </div>
                 <Button className="bg-zinc-900 text-white" onClick={() => setStep(2)}>ادامه</Button>
               </div>
            ) : (
               // محتوای مرحله دوم (رمز یا کد)
               <div className="grid gap-4">
                 <div className="grid gap-2">
                   <Label htmlFor="password">رمز عبور</Label>
                   <Input id="password" type="password" />
                 </div>
                 <Button onClick={() => setStep(1)} variant="outline">بازگشت</Button>
               </div>
            )}
          </form>
          
          {/* بخش عکس سمت راست */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/login.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover object-center dark:brightness-[0.2] dark:grayscale" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}