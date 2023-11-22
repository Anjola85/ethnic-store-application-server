import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { generateOtpCode } from 'src/providers/util/otp-code-util';
import { FaFacebookSquare, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);
  private readonly senderEmailAddress = 'info@quiikmart.com';
  private readonly receiverEmails = [
    { email: 'anjolaa@quiikmart.com' },
    { email: 'dextereromosele@quiikmart.com' },
    { email: 'justinaackah@quiikmart.com' },
    { email: 'kamsi@quiikmart.com' },
  ];
  private readonly attachments = [
    {
      content:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAkUAAAH4CAMAAABzHGnFAAABVmlDQ1BpY2MAACiRdZCxSwJxFMe/l4aQDg0GDUW3SlZyStDQoF6I4HCoYbWdp2lwXj/uTqIh6I+o9hqiKVrChoaaW4KgoKktahWuoeR6P61Oi36Px/fDl/fe7/GAoZDKmO4H0DBsM59JiSura2LgGUGEKX2YUjWLJRUlRyX41sHn3EPgejfDZ02mzIv2y81hRn6dm84enfytH3gjlaqlkX5QJjRm2oAQI1a2bMZ5lzhs0lLEe5xrPeZzw+UeX3Zrivk08S3xqFZXK8RPxNFyn1/r44be1L524NuHqsZygXSccgIylpCjEFFAHAlIFDJK//Qkuj1pbIJhGyY2UEMdNnUnyWHQUSXOwoCGWUSJJcQo4/zWv2/oeTuLwMI5fXXqeYoPOCvS+vOeF9kHxt6A6yxTTfXnsoLjt9bjUo+DLWD4wHXbJSAQAToPrvvect3OMeB7BK6cT1smY7FYVaJOAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAADVUExURf////7+/tvj46i6vZiusbjIydvi4+zw8cnV1v7///7+/5ivsUFmahY6QFx9gXqWmh5ESk5xdZmvsihPVezw8tvj5DRaYGuKjh5FSu3x8k5ydVt9gdzj5IqipZmvscrW17rJy5musnqVmkBlaqm7vmuJjilQVUFlatzk5ClQVhY7QUFmax9FS+3y8l19gZmuscrW2Kq8vk1xdmuKjYmipWqKjihPVKi7vezx8omjpcnU1rjIyjRZX5qvsqm9vjVcYE9ydSlPVB9FSilPVdvi5HmVmk5ydti7DHgAAAABYktHRACIBR1IAAAAB3RJTUUH5wsVBA4XzdsXswAAAZF6VFh0UmF3IHByb2ZpbGUgdHlwZSBpY2MAADiNjVNbbsQgDPznFD2C316Ok0CQev8L1LyqdLVbrSVEsI1nPDjpu5T01U1JEnQjKIYODlZAhges2uXiFDkuRKAPzXoQgF8e4RMAZe7A8d2SobGzg6CCghRY9nz+z1qgdka4HZWpbmZYhZzOR+Mrl/PA4CXXQY1OyQcdj+di6RPEmx0mps7Gi8tizJKiMXDyqQyueDTlHgrB9m8C2FUbas1jlu1P5vfApoxify6c5VZI4gEmItYNAMHIHiH4Qr5WgIq9uRDAbwpVK66751/bD1BM7VLVFd89YjCUABeF8bJSUh+i0CQSua8IMs3VE9U/BUpb9RtSXLIWkxdnz7GiqMVu4bBg1B+ggwuunFjWGZmuQE8OkTo6XV2n6R8M986/E36zlwP5KtErD1U5nzqJH9dz3mhNJ2T8OCpTALZXBSnnUQi1+RAIJcdfgE6GryYbm4HE9Boz3yshnOcoAJqtdWOdZ6c8CrVafQQicez1sPkGdQxkCRXSDy6F40wugWroAAABWHpUWHRSYXcgcHJvZmlsZSB0eXBlIHhtcAAAKJGFU1tygzAM/PcpegSjpzkOxfZfZ/rZ43dlaCCQSfHkJWm1q7WSfr6+00c8IiXx6oUXL1Y9WzV1sYly/LbVmnPkuBLZZGLdyJSXLf6o7kSU09EGwc+AaJGqmbKwdQeQMhs1zuNF3PJCOQ4kEJobL0oiSezCvyVDQ3HBybyAs/t4qDmKqA0Kp84Tz3GoJ85MCBDe69YEn+wz2kK2F6pBEOlDy1WRiGlyNkZgHqPNcKFB4V4AXwjccCIUwoinRufjJR1DwbqCVi/GGpraYTe+wz+ryOyYGG0aJva79L8BHgSLZigvprbqLKEf9xYkMUmyxo0VTgmvB8N7UGCupOkNa3nVAKQFd3UjTe9A/46qqFWn2Lgwe4MLN91uUPd2BTd2HfgEPSPzkp7ZqJ93474a570+avfNjuQI3/5zg+kX0qPVy0lFlBUAAA/lSURBVHja7d3/Q9s2GsfxeBBCejgwck1C2wQ3pVnqhNCu0LW9reXWu/v//6TDXxJLzyM54ejNYnu/ftqsxIbqgyVbstxqAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAh4p+2NtvH0T+8s7hXXm36R8TjYsO9/f3nEl58rejOHN04P5mt12U9w5a+EuLjk98Sen+GK+dur7a7a2L+39v+tdAk54ONklpy7LhpigenTm+a5Q/a/r3QJOe+5PyIjaM9VcnZvl5078ImpOYSXhpl43Nsqn+7iuz/Ljp3wTNmdakyCq7UF+1TlXxUdO/CZrz2kxCYpeZ56mZ/qrVoMWjpn8TNMdMyk+ysIrYbK6/+txKUTzf5XD4c9pcrMdvdA6maV6SLlwReWWnKGn6N0GDyqQsh5eOwvlktVqNL51fHNkpumjhL2w+Ga6GV5f3/dqZHSLZNQd28JYU4cHexbRoeKixSFHS9A+ER+g1KcKuos7efrvjmED0s0gR94sema6o1G50x9wQHdbPLROiH/bdSdlMIHrfUUXidlFsDeV29qfTvZ2Pjz/Y3anhetq7mV7fheRJselJ++ZDfHJ0uqm0TjljaHDqCEY324FVw91fvEmp5n4MPsoicbsoNo9xnf8A/WPmQAao2zn+UFVb/9lpdrrprKeSDcpPHVSfea92cfC8SFh/M+3sY8+fFGM8tifLRIgGRlHP+yU0rjOMpaNTIzPl5AwjaPEnsYvPJ6o3bOxUhs4atf+HXTaXP0lVZGSP+SKhaZ/E9Yph9YneVDESVs5OtG77JPanrcuwvl2WiINXp50z4yDOKZJoTHcab5XPN/zV2pRYOzETVp48rKSISUI9a1e/WWXypuPUeRDuaAelK1uzNE1VirIqs+eOxUNrL+bVeZkY+1IrsT5ul9kRG4tjX7i/NWwhGF3rtJAuphfzeTKeOVJkzx0Ts+rN6ypniuyk2Kc1+1penhqTdYEdY/rXAbHORIuk3Dr/YNdkliJxS9m8dLJboTIwYhdWUkZ69xt2a2ekyI4XKQqHWTPLL5vNLxw1KW4GWn1ia3ZimSJvw6TLrETIm47rW9cH9mZatGC0jWr5aow0iNYrP5GIc4uZItd0e3nBbta6LLPOa6K126ToyN48biEMT41kzMzZZD87allUrpkiO3RFiuQFu9mPkmXWbQN567psCr3dJTTMbIisMU9Rk9l5RM5ANFNkn6bcKTI/Ly/mrU6TLCu2HtR9BQ0ya8bqmsgEJC3dChmpEKEodjV2p8FdZkR47vzegWhPeUotGEY/tm+disTlWB4YOY/VaIVE+1ekSN3LNI6gypKqTCY4T9HHgdz6WwtBMOvr2ioRHdye/LR9bnkaOz6uLtjNFMkZRGaK3jmOE6md9WnQAmHUpT2UJa/z84t0f4rEQ4hliuQFu7lqgypLqrKxzEur1TmSn+duUSjMrNjtg+s6X50jNsE7k12W4ppeXrCbSakrk63dqNuWB5ANMJpj/NGL9sF1nd+68qVIZq4cPpUX7GZS6spU4yVPdTr1aI5xQhDtg+M6X58jNilSZ4oiRarmk83+z2rKdJ/JgfvWoTAbNLt9kD2gYuzClyJ1KipSpC7YjaS8rSnTfSaNTlEwjH7OwC6RTUjR3MmWZn3DRnda8hSpzrjRu9ZlSXV0vT9CFC7jnpBYzUzUY5kx2dKUKdKnomKEXl2wGye8q5oy3RIKKXNlA2K0HIlVINubnvq8mSLHqSNP0VhtrnrwdWW6z2RbJi2EY+Sqw4xs0MrrIXl1XoTLcSoqUqSn4VZHeF1T9jauteASPyhVzYiJ+PLsUvZn5NV53gy+cPVi8hTpu83VEerKkrjOKc+hBWXurMM7157zhNycp2joquokK1GXWsbwaV3Zu7gWa/EHxWg5rHPRqaeGVUuTtWi/OGs6yT7/q2c/zjJj7tE43uKYx6vDYbYcRl9DhWjduVYtzaCrp2sYKVJFxp3CUU3Z9sea+m2atVCY55bq2tnxfGM5M1W3NL1jz8OQSfZ5tdW4neA7RqYXb+d67h9NMO8tjw6LbdG1o8qSouxqh9otZd1xfcFezd6vK9tpACTu08sOhFkro+ODKOq0j1w1Vn482aV2C1kDWTfIocvqJo240csOg+jinnhGHtajI/PtNWumKHFuLegy44aV+jFOZs6DjD5xOgrA63gnm8un0W6f96aoOnJdmT7Ms9bEnaP3XKw1b8cmatMprmtq+urMorpRxk2pujLd885unbtz1KdVa95PO6Vo0/G98H9mZuci+7RKinG7qK5M97yLltCZo/6Lpv8NMd+pjao6vgPfR07mVqcpz4S67VOXImOqh+p+VVMqHTlijkjzXNf1SvXxc88n0i92nzi/+6SSYtxYPJPxNUdYZZkxN1bniJdeBWCqFyqqq6eJ8xP5VA3z1JNnQiblxEyKiK81YUicxOy3p6kcNf0viDtzUSvLW9kSWY+gThypK6ZqnP1TZsJOSmq/qdqM79J+FM7urqm3p9k54s3EYZgs1hWaLldXl+rKzX6QWaYufbNucM7LkmomopWURBx2vj5supI5OTPGQL46ZhMZOfqdyUahmF9Mp6vp+KKoEf/SnIWL29SIXWLsZjhYprOhuWWdlOXU8XKr8/HtYuF+Qdpklhb7v245TQbli9d4u3Wg3m1JUat1mYyHq9VqOE627mw+Xi1Ww4t7vyDtLmLDVd3+sx3fTu+/X/wxrramCNhmSorwYLXXaIGI2vt7DH6ETKZo8PBdfmflC2V4n0zAvE/jB2N9I+D9w3eF/5Nx6CmqYp40/aPA5yrwFBmjMCF22ZCTs1nD6hd1I3PYd6/diegdhUjO7wnpD76zfyNnhveZfx0kMaUxoPHOa/eDS1ysBUh0r8NZtcz7uCM3RsMjJgZdPHyP30fNNHEWLQ6P9Tf/LZgaeu5PEfNDwnP2e1U/6ZeH7+87qXkEpekfDQ7nm2lgb5Kmf5aK//l9VugL02SxTNPZ7TikCTy+fpFvKhvg4HzUQE+4BerMn4tn+E9eBXW2xONg97BDG+KDFh3uT7/nXLBu1Dnc29/fbx9G0WZT5FiwIfphf3/vwHlD2l7mJKTBGbh0ynXS5PVP1LlLwv1HQaPOfm/THJ0cnWYhidq9Dx8Gn2RQy0WU3rsOYN8QDWhwBi6/bIas/mFs7XaO16Ohg5uD3dd9ifTyWu87n8vH/sXCH5uHIY1JaJtA2ftg5CNsxu1r451XBzfWcOjRjs1ddOxaX6t/4jiCtWhtkv1/t9O+nvam1+1OV803mO52fDTDeoPneuHOSK8FusvtviftrW+HMXdjfPiu29NtV8HtHcr1REhR0Kwhq7IPe+Ba8/HT1l11ftyWoTgeVScjcz2JUasztD9Gih4R8dbY/Laee2Xr0bZG7fP211TF5RsfctYCs/IslogUjVsI11hXlmd59G0X26fxTqpusnURJlrQb7Roj8krVccH3lNKUrcjNa8sHaxul3onm9uHL2K/N+ek6DER61cNatbiq50KqZZq+5pkmx1zFtcdI8+bZNJ0MLy6bJGiR0Q+BdI36j2VZ5KaJfE+yzD0ykEvvUTyegUZ16TYbDWb8osiReFM5oUip2CM/lX9d6KWZEx8u3kqW8Gf1iXGumuldfda52tpLYgkUtn0vxT81Lqe1cX6sV4a33uhJGe4zqrhdzVVaN02yXeAiOWzSNHj4X+11LeWTpGvKuVKotbqoD96diL69XJRR1L0ePjf7JC09NL4vmt9mbbfzEJ5nlqPq9op+qZWfHR/CwHyTnDOAjN3bXSY1H5MRmzg3J6ove4WYATAm6Kk5ejSeJoVmRPrtKLWzV5f6Vldd0dISNGj4UtRfm9wLLeWHeNswpkx5UzmxM6afiiovGG0LSSk6NHwpSjv2ag3KebPzmYTzrJq3SyNLj+WmAd4qvdd3jC6X4rCWs4EFk+KimGKX131/3kz3l9O8jhzfnfN8ZTrS8fXHG1l3V4RFE+KikpVm1v2SEcxV6R26fUDx86LdnHu/1LLcXRSFDBPivL+sX4duhguK+YKyZsF1pIRrkG5IjGk6M/Dfb+o6KWM9ea2vSFv02T32ZwT63yxUdHFsTNKih4z973r4q6h6lwP5XBZfjKS24y9e6a75WVbU2R/lxQFbOyvZt25vlBd5aSlek/m1ZZnkomjvXRM/BAJbPpfCn5XrlouTgz6pa66E5XN1/CnyDdIl/ecSNGfh3OqWJIX6XU79FKLfT1Msmmbut6R3qHePSl6zFxLvJRdkHG8g7lK0XrYNBp6v5R/xD4LOlIkeu3dJxErFQdq7qjk8mzyc7yDl2oPRQa7zoeRzI/cN0U3z46ObvZ2f0YXf5wzRyWXIxQ1q+JVhvre5HEURe2b2m9ll3b3TVEZQFa8DtFIV5S3xOFIj+jH/cHJlm9l3ev/LUVx/2PT/2LQ9B2dcp78WbyL0S4t37/lhuxu5dYU1Q7OICj6L75s0Fz97uXwaixebD3f3gu/VoHMutdbU+SZhjkKZjllbKi/+HWDplOUDrPp9XP7oY4LZwfdCpGOanZbc2uKfOnkXdbhUX/x6we/VDhmSVFgx+vllm748ovrIHOZIsfjZm89e0ya/ieDov7iN0PyYgDk62YerNXtnta+biF+k39L3dt8Kbe5ejvu7j0DagFSQyCbbocdjq/Vw2KvZfV7HyQp2kBHT324w2isZwCFZdMDJNsNozrNWlwYTxxa9Z91aM48o67Vav7ySnAoW0zXA9Tm2yU2mDkbJNFwmX3XSXk9ltpL3lsPXuefn3911PfS6DHLPnzSEg1W4vrRHLOT3rBuepDslkW0F5Ph7Wo1TsRXjEyUp64z1ajZz0uLrlN+5pnKDZpq0xYsnB4o82UJu63McTbTtTqZGbtJxTP39skoHYq9pN7DTqy7U7wFJGDJ7L61NP9Pqhu6pDdLM8uBufTH2ut1yNLFpnSaf2G5SGqONF2nM13wBoewXfQWs/u9leh8PFUNXat1eZ6c+zou8/HtYrFYja3y8yQ533bUZDxcraZXRAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADTlv5g9zRGn1yiBAAAAVmVYSWZNTQAqAAAACAABh2kABAAAAAEAAAAaAAAAAAADkoYABwAAABIAAABEoAIABAAAAAEAAAJFoAMABAAAAAEAAAH4AAAAAEFTQ0lJAAAAU2NyZWVuc2hvdKfY6Q8AAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMTEtMjFUMDQ6MTQ6MjMrMDA6MDCGJHk2AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTExLTIxVDA0OjE0OjIzKzAwOjAw93nBigAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0xMS0yMVQwNDoxNDoyMyswMDowMKBs4FUAAAASdEVYdGV4aWY6RXhpZk9mZnNldAAyNlMbomUAAAAYdEVYdGV4aWY6UGl4ZWxYRGltZW5zaW9uADU4Mf7lUi8AAAAYdEVYdGV4aWY6UGl4ZWxZRGltZW5zaW9uADUwNNtZzd4AAAAWdEVYdGV4aWY6VXNlckNvbW1lbnQAQVNDSUm041reAAAAKHRFWHRpY2M6Y29weXJpZ2h0AENvcHlyaWdodCBBcHBsZSBJbmMuLCAyMDIzk7OPCgAAABx0RVh0aWNjOmRlc2NyaXB0aW9uAERFTEwgUzM0MjJEVwP7gS0AAAAXdEVYdHhtcDpQaXhlbFhEaW1lbnNpb24ANTgx5OofogAAABd0RVh0eG1wOlBpeGVsWURpbWVuc2lvbgA1MDTBVoBTAAAAGnRFWHR4bXA6VXNlckNvbW1lbnQAU2NyZWVuc2hvdNPgsnwAAAAASUVORK5CYII=',
      filename: 'logo.png',
      type: 'image/png',
      disposition: 'attachment',
    },
  ];

  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async customerWelcomeEmail(receiverEmail: string, name: string) {
    const mail: SendGrid.MailDataRequired = {
      to: receiverEmail,
      bcc: this.receiverEmails,
      subject: `Welcome to Quiikmart's Journey - Let's Get Started! 🚀`,
      from: { name: 'QuiikMart Team', email: this.senderEmailAddress },
      text: `Dear ${name}, welcome to the initial stage of Quiikmart's innovative experience - our waitlist! Your early interest propels us towards a successful pilot and final product launch. ...`, // Plain text version of the email
      html: `
          <h3>Hello ${name}!,</h3>
          <p>We're delighted to welcome you to the Quiikmart community. Your inclusion on our waitlist marks the first step in our shared journey to revolutionize the way you access local ethnic groceries.</p>
          <p>Here's a glimpse of what's coming:</p>
          <ol>
            <li><strong>Waitlist Confirmation:</strong> You've taken the first leap! Being on our waitlist gives you priority access to our updates and upcoming pilot app.</li>
            <br>
            <li><strong>Exclusive Pilot Access:</strong> Slated for early 2024, our pilot app launch will be your opportunity to be among the first to experience Quiikmart's unique offerings.</li>
            <br>
            <li><strong>Product Market Fit:</strong> Your feedback during the pilot will be invaluable in shaping the final product, ensuring we meet your expectations and preferences.</li>
            <br>
            <li><strong>Final Product Launch:</strong> With insights gained from the pilot, we will unveil the complete Quiikmart experience, crafted to bring the world of local ethnic groceries to your fingertips.</li>
          </ol>
          <p>In the interim, let's stay connected. Follow us on our social channels for updates, sneak peeks, and more:</p>
          <table align="center" width="70%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 10px;">
              <a href="https://www.instagram.com/quiikmart/" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/instagram_icon.png" alt="Instagram" width="50" height="50" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://www.facebook.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/facebook_icon.png" alt="Facebook" width="40" height="40" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://twitter.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/twitter_icon.png" alt="Twitter" width="40" height="40" style="display: block;"/>
              </a>
            </td>
          </tr>
        </table>
          <p>Thank you for embarking on this journey with us. We're excited for the future and can't wait to serve you!</p>
          <p>Warmest regards,<br>
         <i>~The Founders of <a style="text-decoration: none;" href="https://www.quiikmart.com/">Quiikmart</a></i></p>
        `,
      // attachments: this.attachments,
    };
    console.log('sending mail');

    return await this.sendWaitlistEmail(receiverEmail, name, mail);
  }

  async shopperWelcomeEmail(receiverEmail: string, name: string) {
    const mail: SendGrid.MailDataRequired = {
      to: receiverEmail,
      bcc: this.receiverEmails,
      subject: `Your Journey To Become a Quiikstar Starts Here 🚀`,
      from: { name: 'QuiikMart Team', email: this.senderEmailAddress },
      text: `Hello ${name}, you've taken the first step to becoming a Quiikstar, the driving force behind Quiikmart. As we gear up for our pilot in early 2024, your early involvement is key to our community-driven success. ...`, // Plain text version of the email
      html: `
          <h3>Welcome Aboard, ${name}!</h3>
          <p>We're thrilled to welcome you to the Quiikstars. 
          We understand how delivering groceries can be a hassle, and we're here to change that.
          Delivery drivers are essential to the Quiikmart experience. 
          Your initiative to join our waitlist is the spark that will ignite a revolution in grocery delivery.</p>
          <p>Here's what awaits you as a Quiikstar:</p>
          <ol>
            <li><strong>Waitlist Confirmation:</strong> You're in the starting lineup! This means you'll be among the first to be updated on our progress and receive exclusive access to the Quiikmart driver app.</li>
            <br/>
            <li><strong>Early Access to the Pilot App:</strong> Your feedback will be instrumental as we test and perfect our systems, ensuring a smooth ride as we approach the launch.</li>
            <br/>
            <li><strong>Community Engagement:</strong> Join our growing community of Quiikstars and contribute to shaping a delivery service that stands apart.</li>
            <br/>
            <li><strong>Official Launch:</strong> You'll be the face of Quiikmart, bringing a world of local ethnic groceries to our customer's doorsteps.</li>
          </ol>
          <p>Follow our journey and join the conversation on social media:</p>
          <table align="center" width="70%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 10px;">
              <a href="https://www.instagram.com/quiikmart/" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/instagram_icon.png" alt="Instagram" width="50" height="50" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://www.facebook.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/facebook_icon.png" alt="Facebook" width="40" height="40" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://twitter.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/twitter_icon.png" alt="Twitter" width="40" height="40" style="display: block;"/>
              </a>
            </td>
          </tr>
        </table>
        
          <p>Thank you for joining us at this exciting time. Together, we'll drive towards a future full of possibility.</p>
          <p>On the road to success,<br>
          <i>~The Founders of Quiikmart</i>
          </p>
        `,
      // attachments: this.attachments,
    };

    return await this.sendWaitlistEmail(receiverEmail, name, mail);
  }

  async businessWelcomeEmail(receiverEmail: string, name: string) {
    const mail: SendGrid.MailDataRequired = {
      to: receiverEmail,
      bcc: this.receiverEmails,
      subject: `Quiikmart Partnership Awaits: Welcome, ${name}! 🚀`,
      from: { name: 'QuiikMart Team', email: this.senderEmailAddress },
      text: `Dear ${name}, your business is now poised to join an exciting venture with Quiikmart. As we approach the launch of our pilot in early 2024, your early registration is a step towards mutual growth and success. ...`, // Plain text version of the email
      html: `
          <h3>Partnering for Success!</h3>
          <p>Welcome to the Quiikmart family! We're excited to have your business on our waitlist, a significant step towards unlocking new opportunities and expanding your reach through our platform.</p>
          <p>As a valued partner, here's what you can look forward to:</p>
          <ol>
            <li><strong>Waitlist Confirmation:</strong> Your business is now in the priority circle for updates on our progress and for the first look at our business interface on the Quiikmart platform.</li>
            <br/>
            <li><strong>Pilot Program Participation:</strong> You will have early access to our pilot app, offering a unique opportunity to shape our services and ensure they align perfectly with your business needs.</li>
            <br/>
            <li><strong>Community and Network Building:</strong> Engage with a growing network of businesses and customers, and be part of a marketplace that values local ethnic products.</li>
            <br/>
            <li><strong>Full Launch Inclusion:</strong> Your offerings will be featured as we roll out the full Quiikmart experience, connecting you with a broad audience eager for ethnic and local groceries.</li>
          </ol>
          <p>Let's start the conversation and grow together. Connect with us on our social platforms:</p>
          <table align="center" width="70%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" style="padding: 10px;">
              <a href="https://www.instagram.com/quiikmart/" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/instagram_icon.png" alt="Instagram" width="50" height="50" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://www.facebook.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/facebook_icon.png" alt="Facebook" width="40" height="40" style="display: block;"/>
              </a>
            </td>
            <td align="center" style="padding: 10px;">
              <a href="https://twitter.com/quiikmart" target="_blank" style="text-decoration: none;">
                <img src="https://www.quiikmart.com/images/twitter_icon.png" alt="Twitter" width="40" height="40" style="display: block;"/>
              </a>
            </td>
          </tr>
        </table>
          <p>We're committed to our partners' success and can't wait to embark on this journey with you.</p>
          <p>Together towards growth,<br>
          <i>~The Founders of Quiikmart</i>
          </p>
        `,
      // attachments: this.attachments,
    };

    return await this.sendWaitlistEmail(receiverEmail, name, mail);
  }

  async sendWaitlistEmail(
    receiverEmail: string,
    name: string,
    mail: SendGrid.MailDataRequired,
  ): Promise<any> {
    try {
      // send otp code to email
      await this.send(mail);

      const maskedEmail = receiverEmail;

      // replace first 5 digits with *
      const maskedEmailAdd = maskedEmail.replace(
        maskedEmail.substring(0, 5),
        '*****',
      );

      // log success repsonse
      this.logger.log('Email sent successfully to: ' + name);

      // return success response to client
      return {
        status: true,
        message: 'Email sent successfully',
      };
    } catch (error: HttpException | any) {
      // log error response
      this.logger.error('Error sending email:', error);
      return {
        status: false,
        message: 'Failed to send email',
      };
    }
  }

  /**
   * This method sends an email to the receiver email address containing the otp code
   * @param receiverEmail
   * @param emailAddress
   * @param name
   * @returns Promise<any>
   */
  async sendOTPEmail(
    receiverEmail: string,
    codeLength = 4,
    expirationMinutes = 5,
  ): Promise<any> {
    // email address of sender is quickmartdev
    const senderEmailAddress = 'quickmartdev@gmail.com';

    // generate otp code
    const otpResponse = generateOtpCode(codeLength, expirationMinutes);

    // set otp code and expiry time
    const otpCode: string = otpResponse.code;
    const expiryTime: string = otpResponse.expiryTime;

    // create mail object
    const mail = {
      to: receiverEmail,
      subject: 'Welcome to Quickmart! One-Time Password (OTP) Verification',
      from: senderEmailAddress,
      text: `Please verify your email address by entering the OTP code: ${otpCode}`,
      html: `<h3>Hello!,</h3>
            <p>Thank you for joining Quickmart! <br/> To complete your account registration, please verify your email address by entering the OTP (One-Time Password) code provided below:</p>
            <h4>OTP Code: ${otpCode}</h4>
            <p>Please enter this code within 5 minutes to verify your account. If you did not sign up for an account with Quickmart, please disregard this email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@quickmart.com</p>
            <p>Welcome once again, and we look forward to serving you!</p>
            <p>Best regards,<br>Quickmart Team</p>`,
    };

    try {
      // send otp code to email
      await this.send(mail);

      const maskedEmail = receiverEmail;

      // replace first 5 digits with *
      const maskedEmailAdd = maskedEmail.replace(
        maskedEmail.substring(0, 5),
        '*****',
      );

      // log success repsonse
      this.logger.log(
        'Email sent successfully to: ' +
          maskedEmailAdd +
          ' with expiry time: ' +
          expiryTime,
      );

      // return success response to client
      return {
        status: true,
        message: 'Email sent successfully',
        code: otpCode,
        expiryTime: expiryTime,
      };
    } catch (error: HttpException | any) {
      // log error response
      this.logger.error('Error sending email:', error);
      // return error response to client
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method sends an email to the receiver email address containing the otp code
   * @param mail
   * @returns
   */
  async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    const mailTo = mail.to.toString();
    const maskedEmail = (mailTo.substring(0, 5), '*****');
    this.logger.log(`E-Mail sent to ${maskedEmail}`);
    return transport;
  }
}
