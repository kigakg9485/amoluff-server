import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const arabCountries = [
  "المملكة العربية السعودية",
  "دولة الإمارات العربية المتحدة", 
  "جمهورية مصر العربية",
  "جمهورية العراق",
  "المملكة الأردنية الهاشمية",
  "الجمهورية اللبنانية",
  "الجمهورية العربية السورية",
  "دولة الكويت",
  "دولة قطر",
  "مملكة البحرين",
  "سلطنة عمان",
  "الجمهورية اليمنية",
  "دولة فلسطين",
  "المملكة المغربية",
  "الجمهورية الجزائرية",
  "الجمهورية التونسية",
  "دولة ليبيا",
  "جمهورية السودان",
  "جمهورية الصومال",
  "جمهورية جيبوتي",
  "الجمهورية الإسلامية الموريتانية",
  "الاتحاد القمري"
];

export default function ApplicationModals() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    age: "",
    country: "",
    benefit: "",
    experience: "",
    responsibility: false,
    oath: ""
  });
  const [scriptForm, setScriptForm] = useState({
    name: "",
    age: "",
    languages: "",
    experience: "",
    maps: "",
    frequency: ""
  });
  const [hacksForm, setHacksForm] = useState({
    name: "",
    age: "",
    serverLogo: "",
    previousServers: "",
    hackTypes: "",
    activeHours: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setOpenModal(event.detail.type);
    };

    window.addEventListener('openApplicationModal', handleOpenModal as EventListener);
    return () => {
      window.removeEventListener('openApplicationModal', handleOpenModal as EventListener);
    };
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: { type: string; formData: any }) => {
      const response = await apiRequest('POST', '/api/applications', data);
      return response.json();
    },
    onSuccess: () => {
      setOpenModal(null);
      resetForms();
      toast({
        title: "تم إرسال التقديم بنجاح!",
        description: "سيتم مراجعة طلبك والرد عليك قريباً في السيرفر",
      });
    },
    onError: (error: any) => {
      toast({
        title: "فشل في إرسال التقديم",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForms = () => {
    setAdminForm({
      name: "",
      age: "",
      country: "",
      benefit: "",
      experience: "",
      responsibility: false,
      oath: ""
    });
    setScriptForm({
      name: "",
      age: "",
      languages: "",
      experience: "",
      maps: "",
      frequency: ""
    });
    setHacksForm({
      name: "",
      age: "",
      serverLogo: "",
      previousServers: "",
      hackTypes: "",
      activeHours: ""
    });
  };

  const validateOath = (oath: string): boolean => {
    const required = "اقسم بان لا اضر السيرفر وان لا اغدر بالسيرفر";
    // Remove all diacritics, punctuation, and normalize text
    const normalizeText = (text: string) => {
      return text.trim()
        .toLowerCase()
        .replace(/[\u064B-\u065F\u0670\u0671]/g, '') // Remove diacritics
        .replace(/[أإآ]/g, 'ا') // Normalize alif variants
        .replace(/[ىي]/g, 'ي') // Normalize ya variants
        .replace(/ة/g, 'ه') // Normalize ta marbuta
        .replace(/[^\u0600-\u06FF\s]/g, '') // Remove non-Arabic characters
        .replace(/\s+/g, ' '); // Normalize spaces
    };
    
    const normalizedOath = normalizeText(oath);
    const normalizedRequired = normalizeText(required);
    
    // Check if oath contains the key words
    const keyWords = ['اقسم', 'اضر', 'السيرفر', 'اغدر'];
    const hasAllKeyWords = keyWords.every(word => normalizedOath.includes(word));
    
    return hasAllKeyWords || normalizedOath === normalizedRequired;
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOath(adminForm.oath)) {
      toast({
        title: "خطأ في القسم",
        description: "يجب كتابة القسم بالضبط كما هو مطلوب",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      type: "admin",
      formData: adminForm
    });
  };

  const handleScriptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      type: "script", 
      formData: scriptForm
    });
  };

  const handleHacksSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({
      type: "hacks",
      formData: hacksForm
    });
  };

  return (
    <>
      {/* Admin Application Modal */}
      <Dialog open={openModal === 'admin'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">تقديم طلب الإدارة</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>ما هو اسمك؟</Label>
                <Input 
                  data-testid="input-admin-name"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
              
              <div>
                <Label>كم عمرك؟</Label>
                <Input 
                  data-testid="input-admin-age"
                  type="number"
                  value={adminForm.age}
                  onChange={(e) => setAdminForm(prev => ({ ...prev, age: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label>من أي دولة؟</Label>
              <Select 
                value={adminForm.country}
                onValueChange={(value) => setAdminForm(prev => ({ ...prev, country: value }))}
                required
              >
                <SelectTrigger data-testid="select-admin-country" className="text-right">
                  <SelectValue placeholder="اختر دولتك" />
                </SelectTrigger>
                <SelectContent>
                  {arabCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>بماذا ستفيد السيرفر؟</Label>
              <Textarea 
                data-testid="textarea-admin-benefit"
                value={adminForm.benefit}
                onChange={(e) => setAdminForm(prev => ({ ...prev, benefit: e.target.value }))}
                className="text-right resize-none"
                rows={3}
                required 
              />
            </div>
            
            <div>
              <Label>ما هي خبرتك في Discord؟</Label>
              <Textarea 
                data-testid="textarea-admin-experience"
                value={adminForm.experience}
                onChange={(e) => setAdminForm(prev => ({ ...prev, experience: e.target.value }))}
                className="text-right resize-none"
                rows={3}
                required 
              />
            </div>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox 
                    id="responsibility"
                    data-testid="checkbox-admin-responsibility"
                    checked={adminForm.responsibility}
                    onCheckedChange={(checked) => setAdminForm(prev => ({ ...prev, responsibility: !!checked }))}
                    required
                  />
                  <Label htmlFor="responsibility" className="text-sm">
                    <strong>هل ستتحمل المسؤولية؟</strong><br />
                    <span className="text-muted-foreground">أقر بأنني سأتحمل المسؤولية كاملة في إدارة السيرفر والالتزام بالقوانين</span>
                  </Label>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <Label>القسم (يجب كتابة النص التالي بالضبط)</Label>
              <Card className="mb-2">
                <CardContent className="p-3">
                  <strong>النص المطلوب:</strong> "أقسم بأن لا أضر السيرفر وأن لا أغدر بالسيرفر"
                </CardContent>
              </Card>
              <Textarea 
                data-testid="textarea-admin-oath"
                value={adminForm.oath}
                onChange={(e) => setAdminForm(prev => ({ ...prev, oath: e.target.value }))}
                placeholder="اكتب القسم هنا..."
                className="text-right resize-none"
                rows={2}
                required 
              />
            </div>
            
            <Button 
              type="submit"
              data-testid="button-submit-admin"
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "جاري الإرسال..." : "إرسال التقديم"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Script Publisher Application Modal */}
      <Dialog open={openModal === 'script'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">تقديم نشر السكربتات</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleScriptSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>ما هو اسمك؟</Label>
                <Input 
                  data-testid="input-script-name"
                  value={scriptForm.name}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
              
              <div>
                <Label>كم هو عمرك؟</Label>
                <Input 
                  data-testid="input-script-age"
                  type="number"
                  value={scriptForm.age}
                  onChange={(e) => setScriptForm(prev => ({ ...prev, age: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label>ما هي لغات البرمجة التي تعرفها؟</Label>
              <Textarea 
                data-testid="textarea-script-languages"
                value={scriptForm.languages}
                onChange={(e) => setScriptForm(prev => ({ ...prev, languages: e.target.value }))}
                placeholder="مثال: JavaScript, Python, C++, etc..."
                className="text-right resize-none"
                rows={2}
                required 
              />
            </div>
            
            <div>
              <Label>هل صنعت أو صممت سكربتات من قبل؟</Label>
              <Textarea 
                data-testid="textarea-script-experience"
                value={scriptForm.experience}
                onChange={(e) => setScriptForm(prev => ({ ...prev, experience: e.target.value }))}
                className="text-right resize-none"
                rows={2}
                required 
              />
            </div>
            
            <div>
              <Label>ما هي الخرائط التي تنزل عنها سكربتات؟</Label>
              <Textarea 
                data-testid="textarea-script-maps"
                value={scriptForm.maps}
                onChange={(e) => setScriptForm(prev => ({ ...prev, maps: e.target.value }))}
                placeholder="مثال: FiveM, SAMP, MTA..."
                className="text-right resize-none"
                rows={2}
                required 
              />
            </div>
            
            <div>
              <Label>هل سوف تنزل سكربتات بشكل يومي؟</Label>
              <Select 
                value={scriptForm.frequency}
                onValueChange={(value) => setScriptForm(prev => ({ ...prev, frequency: value }))}
                required
              >
                <SelectTrigger data-testid="select-script-frequency" className="text-right">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="يومي">نعم، بشكل يومي</SelectItem>
                  <SelectItem value="اسبوعي">بعض أيام في الأسبوع</SelectItem>
                  <SelectItem value="شهري">مرة أو مرتين في الشهر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">💡 اقرأ جيداً</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>الأمان أولاً:</strong> تأكد أن السكربت لا يحتوي على فيروسات أو برمجيات ضارة.</p>
                  <p><strong>قل نوع السكربت الذي ستنزله + اسم الخريطة</strong></p>
                  <p><strong>المسؤولية:</strong> تحمّل المسؤولية الكاملة عن السكربتات التي تنشرها.</p>
                  <p><strong>تنزيل بشكل يومي أو بعض أيام في الأسبوع</strong></p>
                </div>
              </CardContent>
            </Card>
            
            <Button 
              type="submit"
              data-testid="button-submit-script"
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "جاري الإرسال..." : "إرسال التقديم"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hacks Publisher Application Modal */}
      <Dialog open={openModal === 'hacks'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl">تقديم نشر الهاكات</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleHacksSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <div className="text-2xl mb-2">بسم الله الرحمن الرحيم</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>اسمك</Label>
                <Input 
                  data-testid="input-hacks-name"
                  value={hacksForm.name}
                  onChange={(e) => setHacksForm(prev => ({ ...prev, name: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
              
              <div>
                <Label>عمرك</Label>
                <Input 
                  data-testid="input-hacks-age"
                  type="number"
                  value={hacksForm.age}
                  onChange={(e) => setHacksForm(prev => ({ ...prev, age: e.target.value }))}
                  className="text-right"
                  required 
                />
              </div>
            </div>
            
            <div>
              <Label>هل بتحط شعار للسيرفر (𝗮𝗺𝗼)؟</Label>
              <Select 
                value={hacksForm.serverLogo}
                onValueChange={(value) => setHacksForm(prev => ({ ...prev, serverLogo: value }))}
                required
              >
                <SelectTrigger data-testid="select-hacks-logo" className="text-right">
                  <SelectValue placeholder="اختر..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نعم">نعم</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>هل كنت تنزل هاكات في سيرفر ثاني؟</Label>
              <Textarea 
                data-testid="textarea-hacks-previous"
                value={hacksForm.previousServers}
                onChange={(e) => setHacksForm(prev => ({ ...prev, previousServers: e.target.value }))}
                className="text-right resize-none"
                rows={2}
                required 
              />
            </div>
            
            <div>
              <Label>شو نوع الهاكات التي تنزل وما هي أسماء الهاكات؟</Label>
              <Textarea 
                data-testid="textarea-hacks-types"
                value={hacksForm.hackTypes}
                onChange={(e) => setHacksForm(prev => ({ ...prev, hackTypes: e.target.value }))}
                className="text-right resize-none"
                rows={3}
                required 
              />
            </div>
            
            <div>
              <Label>كم ساعة ناشط في اليوم؟</Label>
              <Input 
                data-testid="input-hacks-hours"
                value={hacksForm.activeHours}
                onChange={(e) => setHacksForm(prev => ({ ...prev, activeHours: e.target.value }))}
                placeholder="مثال: 4-6 ساعات"
                className="text-right"
                required 
              />
            </div>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-accent font-medium">بالتوفيق للجميع 🌟</p>
              </CardContent>
            </Card>
            
            <Button 
              type="submit"
              data-testid="button-submit-hacks"
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "جاري الإرسال..." : "إرسال التقديم"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
