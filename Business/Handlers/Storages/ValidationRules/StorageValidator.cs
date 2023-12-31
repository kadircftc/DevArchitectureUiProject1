﻿
using Business.Handlers.Storages.Commands;
using FluentValidation;

namespace Business.Handlers.Storages.ValidationRules
{

    public class CreateStorageValidator : AbstractValidator<CreateStorageCommand>
    {
        public CreateStorageValidator()
        {
            RuleFor(x => x.Quantity).NotEmpty();
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.IsRSale);

        }
    }
    public class UpdateStorageValidator : AbstractValidator<UpdateStorageCommand>
    {
        public UpdateStorageValidator()
        {
            RuleFor(x => x.Quantity).NotEmpty();
            RuleFor(x => x.ProductId).NotEmpty();
            RuleFor(x => x.IsRSale);

        }
    }
}