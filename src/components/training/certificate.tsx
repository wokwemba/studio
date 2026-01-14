
import { forwardRef } from 'react';
import { ShieldCheck } from 'lucide-react';

interface CertificateTemplateProps {
  userName: string;
  courseName: string;
  completionDate: string;
  expiryDate: string;
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ userName, courseName, completionDate, expiryDate }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[1000px] h-[700px] bg-background text-foreground p-10 flex flex-col border-4 border-primary"
        style={{ fontFamily: 'sans-serif' }}
      >
        <div className="flex-1 flex flex-col justify-center items-center text-center border-2 border-secondary p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-16 h-16 text-primary" />
            <h1 className="text-4xl font-bold tracking-wider" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>CCyberGuard</h1>
          </div>

          <p className="text-xl text-muted-foreground mt-4 mb-8">Certificate of Completion</p>

          <p className="text-lg mb-2">This certifies that</p>
          <p className="text-4xl font-bold text-primary mb-4" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{userName}</p>

          <p className="text-lg mb-2">has successfully completed the training course</p>
          <p className="text-2xl font-semibold mb-10">{courseName}</p>

          <div className="w-full flex justify-around items-end mt-auto text-sm">
            <div className="text-center">
              <p className="font-bold border-b border-foreground pb-1">{completionDate}</p>
              <p className="text-xs text-muted-foreground pt-1">Date of Completion</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold" style={{ fontFamily: '"Source Code Pro", monospace' }}>CCyberGuard</p>
                <p className="text-xs text-muted-foreground pt-1">Issuing Authority</p>
            </div>
            <div className="text-center">
              <p className="font-bold border-b border-foreground pb-1">{expiryDate}</p>
              <p className="text-xs text-muted-foreground pt-1">Valid Until</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CertificateTemplate.displayName = 'CertificateTemplate';
